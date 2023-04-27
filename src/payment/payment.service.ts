import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import CryptoJS from 'crypto-js';
import { zaakpay } from 'src/config/zaakpay.config';
import { PaymentEntity } from './entities/payment.entity';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ZaakPayCallbackResponse } from 'src/constant';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(PaymentEntity)
    private paymentRepository: Repository<PaymentEntity>,
  ) {}
  async initiatePayment(createPaymentDto: CreatePaymentDto) {
    const requestData = {
      orderId: uuidv4(),
      merchantIdentifier: zaakpay.MERCHANT_ID,
      email: zaakpay.userEmail,
      amount: createPaymentDto.amount,
      productDescription: createPaymentDto.schemeId,
      paymentMode: 'UPIAPP',
      returnUrl: 'http://localhost:3000/payment/callback',
    };

    const checkSum = this.calculateCheckSum(requestData);

    try {
      const response = await axios.post(
        'https://zaakstaging.zaakpay.com/transactU?v=8',
        {
          data: requestData,
          checkSum: checkSum,
        },
      );

      console.log(response.data);

      const { responseCode, responseDescription, bankPostData } = response.data;
      if (responseCode === 208) {
        // const newPayment = new PaymentEntity(createPaymentDto);
        // newPayment.paymentId = requestData.orderId;
        // newPayment.transactionId = bankPostData.txnid;
        // await this.paymentRepository.save(newPayment);
        const deepLinkUri = bankPostData.androidIntentUrl;
        return {
          responseCode,
          responseDescription,
          url: deepLinkUri,
        };
      } else {
        throw new BadRequestException(responseDescription);
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async handlePaymentCallback(response) {
    console.log(`response: ${response}`);
    // const payment = await this.paymentRepository.findOne({
    //   where: { paymentId: response.orderId },
    // });

    // if (!payment) {
    //   throw new BadRequestException('Payment not found');
    // }

    // if (response.responseCode === 100) {
    //   payment.paymentStatus = 'success';
    //   await this.paymentRepository.save(payment);
    // } else {
    //   payment.paymentStatus = 'failure';
    //   await this.paymentRepository.save(payment);
    // }
    return { message: 'Callback received' };
  }

  calculateCheckSum = (requestData) => {
    CryptoJS.HmacSHA256(requestData, zaakpay.secretKey);
  };
}
