import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export interface Product {
  productId: string;
  quantity: number;
  unit_price: number;
  sellerId: string;
}

@Schema()
export class Cart extends Document {
  @Prop()
  customerId: string;

  @Prop()
  products: Product[];

  @Prop()
  cartTotal: number;
}

export const CartItemSchema = SchemaFactory.createForClass(Cart);
