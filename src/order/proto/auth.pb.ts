/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';

export const protobufPackage = 'auth';

export interface TransferMoneyRequest {
  userId: string;
  sellerId: string;
  amount: number;
}

export interface TransferMoneyResponse {
  status: number;
  response: string;
  error: string;
}

export interface CheckWalletRequest {
  userId: string;
}

export interface CheckWalletResponse {
  walletAmount: number;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  contactNumber: string;
  address: string;
}

export interface RegisterResponse {
  status: number;
  error: string[];
  response: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: number;
  error: string[];
  token: string;
  response: string;
}

export interface ValidateRequest {
  token: string;
}

export interface ValidateResponse {
  status: number;
  error: string[];
  userId: string;
  email: string;
}

export interface LogoutRequest {
  userId: string;
}

export interface LogoutResponse {
  status: number;
  error: string[];
  response: string;
}

export interface UpdateRequest {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  contactNumber: string;
  address: string;
  userId: string;
}

export interface UpdateResponse {
  status: number;
  error: string[];
  response: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  userId: string;
}

export interface ChangePasswordResponse {
  status: number;
  error: string[];
  response: string;
}

export interface ForgetPasswordRequest {
  email: string;
}

export interface ForgetPasswordResponse {
  status: number;
  error: string[];
  response: string;
}

export interface ResetPasswordRequest {
  otp: string;
  email: string;
  password: string;
}

export interface ResetPasswordResponse {
  status: number;
  error: string[];
  response: string;
}

export interface AddWalletAmountRequest {
  userId: string;
  amount: number;
}

export interface AddWalletAmountResponse {
  status: number;
  response: string;
  error: string[];
}

export const AUTH_PACKAGE_NAME = 'auth';

export interface AuthServiceClient {
  register(request: RegisterRequest): Observable<RegisterResponse>;

  login(request: LoginRequest): Observable<LoginResponse>;

  validate(request: ValidateRequest): Observable<ValidateResponse>;

  logout(request: LogoutRequest): Observable<LogoutResponse>;

  update(request: UpdateRequest): Observable<UpdateResponse>;

  changePassword(
    request: ChangePasswordRequest,
  ): Observable<ChangePasswordResponse>;

  forgetPassword(
    request: ForgetPasswordRequest,
  ): Observable<ForgetPasswordResponse>;

  resetPassword(
    request: ResetPasswordRequest,
  ): Observable<ResetPasswordResponse>;

  addWalletAmount(
    request: AddWalletAmountRequest,
  ): Observable<AddWalletAmountResponse>;

  checkWallet(request: CheckWalletRequest): Observable<CheckWalletResponse>;

  moneyTransaction(
    request: TransferMoneyRequest,
  ): Observable<TransferMoneyResponse>;
}

export interface AuthServiceController {
  register(
    request: RegisterRequest,
  ):
    | Promise<RegisterResponse>
    | Observable<RegisterResponse>
    | RegisterResponse;

  login(
    request: LoginRequest,
  ): Promise<LoginResponse> | Observable<LoginResponse> | LoginResponse;

  validate(
    request: ValidateRequest,
  ):
    | Promise<ValidateResponse>
    | Observable<ValidateResponse>
    | ValidateResponse;

  logout(
    request: LogoutRequest,
  ): Promise<LogoutResponse> | Observable<LogoutResponse> | LogoutResponse;

  update(
    request: UpdateRequest,
  ): Promise<UpdateResponse> | Observable<UpdateResponse> | UpdateResponse;

  changePassword(
    request: ChangePasswordRequest,
  ):
    | Promise<ChangePasswordResponse>
    | Observable<ChangePasswordResponse>
    | ChangePasswordResponse;

  forgetPassword(
    request: ForgetPasswordRequest,
  ):
    | Promise<ForgetPasswordResponse>
    | Observable<ForgetPasswordResponse>
    | ForgetPasswordResponse;

  resetPassword(
    request: ResetPasswordRequest,
  ):
    | Promise<ResetPasswordResponse>
    | Observable<ResetPasswordResponse>
    | ResetPasswordResponse;

  addWalletAmount(
    request: AddWalletAmountRequest,
  ):
    | Promise<AddWalletAmountResponse>
    | Observable<AddWalletAmountResponse>
    | AddWalletAmountResponse;

  checkWallet(
    request: CheckWalletRequest,
  ):
    | Promise<CheckWalletResponse>
    | Observable<CheckWalletResponse>
    | CheckWalletResponse;

  moneyTransaction(
    request: TransferMoneyRequest,
  ):
    | Promise<TransferMoneyResponse>
    | Observable<TransferMoneyResponse>
    | TransferMoneyResponse;
}

export function AuthServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      'register',
      'login',
      'validate',
      'logout',
      'update',
      'changePassword',
      'forgetPassword',
      'resetPassword',
      'addWalletAmount',
      'checkWallet',
      'moneyTransaction',
    ];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method,
      );
      GrpcMethod('AuthService', method)(
        constructor.prototype[method],
        method,
        descriptor,
      );
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method,
      );
      GrpcStreamMethod('AuthService', method)(
        constructor.prototype[method],
        method,
        descriptor,
      );
    }
  };
}

export const AUTH_SERVICE_NAME = 'AuthService';
