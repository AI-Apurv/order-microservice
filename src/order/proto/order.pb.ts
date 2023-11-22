/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "order";

export interface GetOrderDetailsRequest {
  userId: string;
}

export interface OrderDetails {
  productId: string;
  quantity: number;
  price: number;
  status: string;
}

export interface GetOrderDetailsResponse {
  data: OrderDetails[];
}

export interface CreateOrderRequest {
  userId: string;
  email: string;
}

export interface CreateOrderResponse {
  status: number;
  error: string[];
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

export interface AddCartRequest {
  productId: string;
  quantity: number;
  userId: string;
}

export interface AddCartResponse {
  status: number;
  response: string;
  error: string[];
}

export interface UpdateCartRequest {
  userId: string;
  productId: string;
  quantity: number;
}

export interface UpdateCartResponse {
  status: number;
  response: string;
  error: string[];
}

export interface GetCartItemRequest {
  userId: string;
}

export interface cartDetails {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface GetCartItemResponse {
  status: number;
  data: cartDetails[];
  cartTotal: number;
}

export const ORDER_PACKAGE_NAME = "order";

export interface OrderServiceClient {
  addCart(request: AddCartRequest): Observable<AddCartResponse>;

  updateCart(request: UpdateCartRequest): Observable<UpdateCartResponse>;

  getCartDetails(request: GetCartItemRequest): Observable<GetCartItemResponse>;

  createOrder(request: CreateOrderRequest): Observable<CreateOrderResponse>;

  cancelOrder(request: CancelOrderRequest): Observable<CancelOrderResponse>;

  getOrderDetails(request: GetOrderDetailsRequest): Observable<GetOrderDetailsResponse>;
}

export interface OrderServiceController {
  addCart(request: AddCartRequest): Promise<AddCartResponse> | Observable<AddCartResponse> | AddCartResponse;

  updateCart(
    request: UpdateCartRequest,
  ): Promise<UpdateCartResponse> | Observable<UpdateCartResponse> | UpdateCartResponse;

  getCartDetails(
    request: GetCartItemRequest,
  ): Promise<GetCartItemResponse> | Observable<GetCartItemResponse> | GetCartItemResponse;

  createOrder(
    request: CreateOrderRequest,
  ): Promise<CreateOrderResponse> | Observable<CreateOrderResponse> | CreateOrderResponse;

  cancelOrder(
    request: CancelOrderRequest,
  ): Promise<CancelOrderResponse> | Observable<CancelOrderResponse> | CancelOrderResponse;

  getOrderDetails(
    request: GetOrderDetailsRequest,
  ): Promise<GetOrderDetailsResponse> | Observable<GetOrderDetailsResponse> | GetOrderDetailsResponse;
}

export function OrderServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      "addCart",
      "updateCart",
      "getCartDetails",
      "createOrder",
      "cancelOrder",
      "getOrderDetails",
    ];
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
