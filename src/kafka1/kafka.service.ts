import { Injectable } from '@nestjs/common';
import { Consumer, Kafka } from 'kafkajs'; 

@Injectable()
export class KafkaService {
  private kafka: Kafka;
  private consumer: Consumer;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'orders-microservice', 
      brokers: ['localhost:9092'], 
    });
    this.consumer = this.kafka.consumer({ groupId: 'kafka-group' });
  }

  getProducer() {
    return this.kafka.producer();
  }
  getConsumer() {
    return this.consumer;
  }
}