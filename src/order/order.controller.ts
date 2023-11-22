import { Controller, HttpStatus, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { OrderService } from './order.service';
import { ORDER_SERVICE_NAME, CreateOrderResponse, CancelOrderRequest, CancelOrderResponse, AddCartRequest, AddCartResponse, UpdateCartRequest, UpdateCartResponse, GetCartItemRequest, GetCartItemResponse, CreateOrderRequest } from './proto/order.pb';
import { CreateOrderRequestDto } from './order.dto';

@Controller('order')
export class OrderController {
  @Inject(OrderService)
  private readonly service: OrderService;

  @GrpcMethod(ORDER_SERVICE_NAME, 'createOrder')
  private async createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
    return this.service.createOrder(data);
  }

  @GrpcMethod(ORDER_SERVICE_NAME, 'cancelOrder')
  private async cancelOrder(data: CancelOrderRequest): Promise<CancelOrderResponse> {
    return this.service.cancelOrder(data);
  }

  @GrpcMethod(ORDER_SERVICE_NAME, 'addCart')
  private async addCart(payload:AddCartRequest):Promise<AddCartResponse>{
   await this.service.addToCart(payload);
   return {status: HttpStatus.OK, response:'Added to cart', error:null}
     }

  @GrpcMethod(ORDER_SERVICE_NAME,'updateCart')
  private async updateCart(payload:UpdateCartRequest):Promise<UpdateCartResponse>{
    await this.service.updateCart(payload);
    return {status: HttpStatus.OK, response:'Cart updated successfuly', error:null}

  }

  @GrpcMethod(ORDER_SERVICE_NAME,'getCartDetails')
  private async getCartDetails(payload:GetCartItemRequest):Promise<GetCartItemResponse>{
    const cartDetailsResponse = await this.service.getCart(payload.userId);
    if(cartDetailsResponse.status === HttpStatus.OK){
      return {status: HttpStatus.OK , data: cartDetailsResponse.data, cartTotal:cartDetailsResponse.cartTotal}
    }
    else{
    return {status: HttpStatus.NOT_FOUND, data: [], cartTotal:0}
    }

  }
  
}