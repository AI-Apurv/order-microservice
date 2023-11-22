import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OrderController } from './order.controller';
import { Order, OrderSchema } from './order.entity';
import { OrderService } from './order.service';
import { PRODUCT_SERVICE_NAME, PRODUCT_PACKAGE_NAME } from './proto/product.pb';
import { MongooseModule } from '@nestjs/mongoose';
import { KafkaModule } from 'src/kafka1/kafka.module';
import { CartItemSchema } from './cart.entity';

@Module({
  imports: [
    KafkaModule,
    ClientsModule.register([
      {
        name: PRODUCT_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          url: '0.0.0.0:50053',
          package: PRODUCT_PACKAGE_NAME,
          protoPath: 'node_modules/grpc-nest-proto/proto/product.proto',
        },
      },
    ]),
    MongooseModule.forFeature([
      {name: 'Order', schema:OrderSchema},
      {name: 'Cart', schema: CartItemSchema},
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}