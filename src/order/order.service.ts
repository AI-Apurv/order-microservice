import {
  HttpStatus,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Order, OrderStatus } from './entity/order.entity';
import {
  FindOneResponse,
  ProductServiceClient,
  PRODUCT_SERVICE_NAME,
  DecreaseStockResponse,
} from './proto/product.pb';
import {
  AddCartRequest,
  AddCartResponse,
  CancelOrderRequest,
  CancelOrderResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  GetCartItemResponse,
  GetOrderDetailsResponse,
  OrderDetails,
  UpdateCartRequest,
  UpdateCartResponse,
} from './proto/order.pb';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { KafkaProducerService } from 'src/kafka1/producer.service';
import { orderResponseMessages } from 'src/common/order.response';
import { Cart } from './entity/cart.entity';
import {
  AUTH_SERVICE_NAME,
  AuthServiceClient,
  CheckWalletResponse,
} from './proto/auth.pb';
import { Transaction } from './entity/transaction.entity';

@Injectable()
export class OrderService implements OnModuleInit {
  constructor(
    @Inject(PRODUCT_SERVICE_NAME)
    private readonly client: ClientGrpc,
    @Inject(AUTH_SERVICE_NAME)
    private readonly client1: ClientGrpc,
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,
    @InjectModel(Cart.name)
    private readonly cartModel: Model<Cart>,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,
    private readonly kafkaProducerService: KafkaProducerService,
  ) {}
  private productSvc: ProductServiceClient;
  private userSvc: AuthServiceClient;

  public onModuleInit(): void {
    this.productSvc =
      this.client.getService<ProductServiceClient>(PRODUCT_SERVICE_NAME);
    this.userSvc =
      this.client1.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  public async createOrder(
    data: CreateOrderRequest,
  ): Promise<CreateOrderResponse> {
    const cart = await this.cartModel.findOne({ customerId: data.userId });
    if (!cart || !cart.products.length) {
      return {
        status: HttpStatus.BAD_REQUEST,
        error: null,
        response: orderResponseMessages.CART_NOT_FOUND,
      };
    }
    const { walletAmount } = await firstValueFrom(
      this.userSvc.checkWallet({ userId: data.userId }),
    );
    if (cart.cartTotal > walletAmount) {
      return {
        status: HttpStatus.BAD_REQUEST,
        response: orderResponseMessages.NOT_ENOUGH_BALANCE,
        error: null,
      };
    }
    const createdOrders: any[] = [];
    for (const product of cart.products) {
      const orderItem = {
        userId: data.userId,
        productId: product.productId,
        quantity: product.quantity,
        price: product.unit_price * product.quantity,
        sellerId: product['sellerId'],
        status: OrderStatus.BOOKED,
      };
      await firstValueFrom(
        this.userSvc.moneyTransaction({
          userId: data.userId,
          sellerId: orderItem.sellerId,
          amount: orderItem.price,
        }),
      );
      const newTransaction = new this.transactionModel({
        creditAccount: orderItem.sellerId,
        debitAccount: data.userId,
        amount: orderItem.price,
      });
      await newTransaction.save();
      const createdOrder = await this.orderModel.create(orderItem);
      createdOrders.push(createdOrder);
      const decreasedStockData: DecreaseStockResponse = await firstValueFrom(
        this.productSvc.decreaseStock({
          productId: product.productId,
          quantity: product.quantity,
        }),
      );
    }
    const productDetails = cart.products.map((product) => ({
      productId: product.productId,
      quantity: product.quantity,
      unit_price: product.unit_price,
    }));
    const kafkaPayload = {
      orderId: createdOrders.map((order) => order.id),
      products: productDetails,
      email: data.email,
    };
    await this.kafkaProducerService.sendToKafka('orderPlaced', kafkaPayload);
    await this.cartModel.deleteOne({ customerId: data.userId });
    return {
      status: HttpStatus.OK,
      response: orderResponseMessages.ORDER_CREATED,
      error: null,
    };
  }

  public async cancelOrder(
    data: CancelOrderRequest,
  ): Promise<CancelOrderResponse> {
    const order = await this.orderModel.findOne({ _id: data.orderId });
    if (order.status === 'canceled')
      return {
        status: HttpStatus.BAD_REQUEST,
        response: orderResponseMessages.ALREADY_CANCELLED,
        error: null,
      };
    const product = await firstValueFrom(
      this.productSvc.findOne({ id: order.productId }),
    );
    if (order.userId !== data.userId)
      return {
        status: HttpStatus.NOT_FOUND,
        response: orderResponseMessages.ORDER_NOT_FOUND,
        error: null,
      };
    else {
      await firstValueFrom(
        this.productSvc.updateStock({
          productId: product.data.id,
          quantity: order.quantity,
        }),
      );
      order.status = OrderStatus.CANCELED;
      await firstValueFrom(
        this.userSvc.moneyTransaction({
          userId: product.data.sellerId,
          sellerId: data.userId,
          amount: order.price,
        }),
      );
      const newTransaction = new this.transactionModel({
        creditAccount: data.userId,
        debitAccount: product.data.sellerId,
        amount: order.price,
      });
      await newTransaction.save();
      await order.save();
      return {
        status: HttpStatus.OK,
        response: orderResponseMessages.ORDER_CANCELLED,
        error: null,
      };
    }
  }

  public async addToCart(addToCart: AddCartRequest): Promise<AddCartResponse> {
    const product: FindOneResponse = await firstValueFrom(
      this.productSvc.findOne({ id: addToCart.productId }),
    );
    if (!product)
      return {
        status: HttpStatus.BAD_REQUEST,
        response: orderResponseMessages.NOT_FOUND,
        error: null,
      };
    let cart = await this.cartModel.findOne({ customerId: addToCart.userId });
    if (!cart) {
      cart = await this.cartModel.create({
        customerId: addToCart.userId,
        products: [
          {
            productId: addToCart.productId,
            quantity: addToCart.quantity,
            unit_price: product.data.price,
            sellerId: product.data.sellerId,
          },
        ],
        cartTotal: product.data.price * addToCart.quantity,
      });
    } else {
      const existingProduct = cart.products.find(
        (p) => p.productId === addToCart.productId,
      );
      console.log('exist', existingProduct);
      if (existingProduct) {
        existingProduct.quantity += addToCart.quantity;
        cart.cartTotal += product.data.price * addToCart.quantity;
      } else {
        cart.products.push({
          productId: addToCart.productId,
          quantity: addToCart.quantity,
          unit_price: product.data.price,
          sellerId: product.data.sellerId,
        });
        cart.cartTotal += product.data.price * addToCart.quantity;
      }
      cart.markModified('products');
      await cart.save();
    }
    return { status: HttpStatus.OK, response: 'Added to cart', error: null };
  }

  public async updateCart(
    payload: UpdateCartRequest,
  ): Promise<UpdateCartResponse> {
    const product: FindOneResponse = await firstValueFrom(
      this.productSvc.findOne({ id: payload.productId }),
    );
    if (!product)
      return {
        status: HttpStatus.BAD_REQUEST,
        response: orderResponseMessages.NOT_FOUND,
        error: null,
      };
    let cart = await this.cartModel.findOne({ customerId: payload.userId });
    if (!cart) {
      return {
        status: HttpStatus.BAD_REQUEST,
        response: orderResponseMessages.CART_NOT_FOUND,
        error: null,
      };
    }
    const existingProduct = cart.products.find(
      (p) => p.productId === payload.productId,
    );
    if (!existingProduct)
      return {
        status: HttpStatus.BAD_REQUEST,
        response: orderResponseMessages.NOT_PRESENT,
        error: null,
      };
    const oldQuantity = existingProduct.quantity;
    existingProduct.quantity = payload.quantity;
    cart.cartTotal =
      cart.cartTotal - (oldQuantity - payload.quantity) * product.data.price;
    cart.markModified('products');
    await cart.save();
    return { status: HttpStatus.OK, response: 'Added to cart', error: null };
  }

  public async getCart(userId: string): Promise<GetCartItemResponse> {
    const cart = await this.cartModel.findOne({ customerId: userId });
    if (!cart) return { status: HttpStatus.NOT_FOUND, data: [], cartTotal: 0 };
    const cartDetails = cart.products.map((product) => ({
      productId: product.productId,
      quantity: product.quantity,
      unitPrice: product.unit_price,
    }));
    return {
      status: HttpStatus.OK,
      data: cartDetails,
      cartTotal: cart.cartTotal,
    };
  }

  public async getOrderDetails(
    userId: string,
  ): Promise<GetOrderDetailsResponse> {
    const order = await this.orderModel.find({ userId: userId });
    if (!order) return { data: [] };

    const getOrderDetails: OrderDetails[] = order.map((order) => ({
      productId: order.productId,
      quantity: order.quantity,
      price: order.price,
      status: order.status,
    }));

    return { data: getOrderDetails };
  }
}
