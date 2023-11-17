/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "order";

export interface CreateOrderRequest {
  productId: string;
  quantity: number;
  userId: string;
  email: string;
}

export interface CreateOrderResponse {
  status: number;
  error: string[];
  id: string;
  response: string;
}

export interface CancelOrderRequest {
  orderId: string;
  userId: string;
}

export interface CancelOrderResponse {
  status: number;
  error: string[];
  response: string;
}

export const ORDER_PACKAGE_NAME = "order";

export interface OrderServiceClient {
  createOrder(request: CreateOrderRequest): Observable<CreateOrderResponse>;

  cancelOrder(request: CancelOrderRequest): Observable<CancelOrderResponse>;
}

export interface OrderServiceController {
  createOrder(
    request: CreateOrderRequest,
  ): Promise<CreateOrderResponse> | Observable<CreateOrderResponse> | CreateOrderResponse;

  cancelOrder(
    request: CancelOrderRequest,
  ): Promise<CancelOrderResponse> | Observable<CancelOrderResponse> | CancelOrderResponse;
}

export function OrderServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["createOrder", "cancelOrder"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("OrderService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("OrderService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const ORDER_SERVICE_NAME = "OrderService";
