import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Transaction extends Document {
  @Prop({ type: String })
  public orderId: string;

  @Prop({ type: String })
  public creditAccount: string;

  @Prop({ type: String })
  public debitAccount: string;

  @Prop()
  public amount: number;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
