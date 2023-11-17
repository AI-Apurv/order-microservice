/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "product";

export interface CreateProductRequest {
  name: string;
  description: string;
  stock: number;
  price: number;
  userId: string;
}

export interface CreateProductResponse {
  status: number;
  error: string[];
  id: string;
  response: string;
}

export interface FindOneData {
  id: string;
  name: string;
  description: string;
  stock: number;
  price: number;
}

export interface FindOneRequest {
  id: string;
}

export interface FindOneResponse {
  status: number;
  error: string[];
  data: FindOneData | undefined;
}

export interface DecreaseStockRequest {
  productId: string;
  quantity: number;
}

export interface DecreaseStockResponse {
  status: number;
  error: string[];
  response: string;
}

export interface SearchResponse {
  id: string;
  name: string;
  description: string;
  stock: number;
  price: number;
}

export interface SearchProductRequest {
  name: string;
}

export interface SearchProductResponse {
  data: SearchResponse[];
  error: string[];
}

export interface UpdateStockRequest {
  productId: string;
  quantity: number;
}

export interface UpdateStockResponse {
  status: number;
  response: string;
  error: string[];
}

export interface UpdateProductRequest {
  productId: string;
  name: string;
  description: string;
  stock: number;
  price: number;
  userId: string;
}

export interface UpdateProductResponse {
  status: number;
  response: string;
  error: string[];
}

export const PRODUCT_PACKAGE_NAME = "product";

export interface ProductServiceClient {
  createProduct(request: CreateProductRequest): Observable<CreateProductResponse>;

  findOne(request: FindOneRequest): Observable<FindOneResponse>;

  decreaseStock(request: DecreaseStockRequest): Observable<DecreaseStockResponse>;

  updateStock(request: UpdateStockRequest): Observable<UpdateStockResponse>;

  searchProduct(request: SearchProductRequest): Observable<SearchProductResponse>;

  updateProduct(request: UpdateProductRequest): Observable<UpdateProductResponse>;
}

export interface ProductServiceController {
  createProduct(
    request: CreateProductRequest,
  ): Promise<CreateProductResponse> | Observable<CreateProductResponse> | CreateProductResponse;

  findOne(request: FindOneRequest): Promise<FindOneResponse> | Observable<FindOneResponse> | FindOneResponse;

  decreaseStock(
    request: DecreaseStockRequest,
  ): Promise<DecreaseStockResponse> | Observable<DecreaseStockResponse> | DecreaseStockResponse;

  updateStock(
    request: UpdateStockRequest,
  ): Promise<UpdateStockResponse> | Observable<UpdateStockResponse> | UpdateStockResponse;

  searchProduct(
    request: SearchProductRequest,
  ): Promise<SearchProductResponse> | Observable<SearchProductResponse> | SearchProductResponse;

  updateProduct(
    request: UpdateProductRequest,
  ): Promise<UpdateProductResponse> | Observable<UpdateProductResponse> | UpdateProductResponse;
}

export function ProductServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      "createProduct",
      "findOne",
      "decreaseStock",
      "updateStock",
      "searchProduct",
      "updateProduct",
    ];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("ProductService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("ProductService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const PRODUCT_SERVICE_NAME = "ProductService";
