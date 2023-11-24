import { IsNumber, IsString, Min } from 'class-validator';
import { CreateOrderRequest } from './proto/order.pb';

export class CreateOrderRequestDto implements CreateOrderRequest {
  @IsString()
  public productId: string;

  @IsNumber()
  @Min(1)
  public quantity: number;

  @IsString()
  public userId: string;

  @IsString()
  email: string;
}
