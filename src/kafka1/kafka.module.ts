import { Module } from '@nestjs/common';
import { KafkaService } from './kafka.service'; 
import { KafkaProducerService } from './producer.service';
import { KafkaConsumerService } from './consumer.service';

@Module({
  providers: [KafkaProducerService, KafkaService, KafkaConsumerService], 
  exports: [KafkaProducerService, KafkaService, KafkaConsumerService], 
})
export class KafkaModule {}