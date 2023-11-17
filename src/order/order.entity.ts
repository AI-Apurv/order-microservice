import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


export enum OrderStatus {
    PENDING = 'pending',
    BOOKED = 'booked',
    CANCELED = 'canceled'
}

@Schema()
export class Order extends Document {

    @Prop({ type: Number, default: 0 })
    public price: number;

    @Prop({ type: String })
    public productId: string;

    @Prop({ type: String })
    public userId: string;

    @Prop({type: String, enum: OrderStatus, default: OrderStatus.PENDING})
    public status: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
