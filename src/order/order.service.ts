import { HttpStatus, Inject, Injectable, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Order, OrderStatus } from './order.entity';
import { FindOneResponse, ProductServiceClient, PRODUCT_SERVICE_NAME, DecreaseStockResponse } from './proto/product.pb';
import { CancelOrderRequest, CancelOrderResponse, CreateOrderRequest, CreateOrderResponse } from './proto/order.pb';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { KafkaProducerService } from 'src/kafka1/producer.service';
import { orderResponseMessages } from 'src/common/order.response';

@Injectable()
export class OrderService implements OnModuleInit {
  constructor(
    @Inject(PRODUCT_SERVICE_NAME)
    private readonly client: ClientGrpc,
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,
    private readonly kafkaProducerService: KafkaProducerService) { }
    private productSvc: ProductServiceClient;


  public onModuleInit(): void {
    this.productSvc = this.client.getService<ProductServiceClient>(PRODUCT_SERVICE_NAME);
  }

  public async createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
    const product: FindOneResponse = await firstValueFrom(this.productSvc.findOne({ id: data.productId }));
    if (product.status >= HttpStatus.NOT_FOUND) {
      return { id: null,  status: product.status, response:orderResponseMessages.NOT_FOUND, error: null };
    } else if (product.data.stock < data.quantity) {
      return { id: null, status: HttpStatus.CONFLICT, response: orderResponseMessages.NOT_AVAILABLE,  error: null };
    }

    const order = new this.orderModel({
      price: product.data.price * data.quantity,
      productId: product.data.id,
      userId: data.userId,
      status:OrderStatus.BOOKED
    });

    try {
      await order.save();
      await this.kafkaProducerService.sendToKafka('orderPlaced', { orderId: order.id, productName: product.data.name, quantity: data.quantity, Totalprice: product.data.price * data.quantity, email: data.email })
    }
    catch (error) {
      return { id: null, error: ['Error saving order'], status: HttpStatus.INTERNAL_SERVER_ERROR, response: null }
    }
    const decreasedStockData: DecreaseStockResponse = await firstValueFrom(
      this.productSvc.decreaseStock({ productId: product.data.id, quantity: data.quantity }),
    );
    if (decreasedStockData.status === HttpStatus.CONFLICT) {
      await this.orderModel.findByIdAndRemove(order._id);
      return { id: null, error: decreasedStockData.error, status: HttpStatus.CONFLICT, response: null };
    }
    return { id: order.id, error: null, status: HttpStatus.OK, response: null };
  }

  public async cancelOrder(data: CancelOrderRequest): Promise<CancelOrderResponse> {
    const order = await this.orderModel.findById(data.orderId)
    const product = await firstValueFrom(this.productSvc.findOne({ id: order.productId }));
    if (order.userId !== data.userId)
      console.log('order not found')
    else {
      await firstValueFrom(this.productSvc.updateStock({ productId: product.data.id, quantity: 2 }))
      order.status = OrderStatus.CANCELED;
      order.save();
      return { status: HttpStatus.OK, response: orderResponseMessages.ORDER_CANCELLED, error: null }
    }
  }

}