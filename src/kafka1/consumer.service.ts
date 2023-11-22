import * as puppeteer from 'puppeteer';
import * as nodemailer from 'nodemailer';
import * as ejs from 'ejs';
import { Injectable } from '@nestjs/common';
import { KafkaService } from './kafka.service'; 

@Injectable()
export class KafkaConsumerService {
  constructor(private readonly kafkaService: KafkaService) {}

  async startConsumer() {
    const consumer = this.kafkaService.getConsumer(); 
    consumer.subscribe({ topic: 'orderPlaced' }); 
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const orderdata = JSON.parse(message.value.toString());
        await this.generatePDFAndSendEmail(orderdata);
      },
    });
  }

  async generatePDFAndSendEmail(orderdata: any) {
    try {
      const pdfPath = await this.generatePDF(orderdata);

      await this.sendEmailWithAttachment(orderdata.email, pdfPath);
    } catch (error) {
      console.error('Error generating PDF and sending email:', error);
    }
  }

  async generatePDF(transactionData: any): Promise<string> {
    const templatePath = '/home/admin2/Desktop/tryingKafka/grpc-nest-order/src/utils/templates/orderPlaced.ejs';
    const renderedHTML = await ejs.renderFile(templatePath, { data: transactionData });

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setContent(renderedHTML);
    const pdfPath = `/home/admin2/Desktop/pdfs/transaction_${transactionData.email}.pdf`;
    await page.pdf({ path: pdfPath, format: 'A4' });

    await browser.close();
    return pdfPath;
  }

  async sendEmailWithAttachment(email: string, pdfPath: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user: 'apurv1@appinventiv.com',
        pass: 'atldfmccuufdvqzm',
      },
    });

    const mailOptions = {
      from: 'apurv1@appinventiv.com',
      to: email,
      subject: 'Order Details',
      text: 'Your order has been placed successfully.Please find attached order details',
      attachments: [{ path: pdfPath }],
    };

    await transporter.sendMail(mailOptions);
  }


}