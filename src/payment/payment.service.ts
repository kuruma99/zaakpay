import { Body, Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CryptoJS } from 'crypto-js';
import { zaakpay } from 'src/config/zaakpay.config';
import { PaymentEntity } from './entities/payment.entity';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ZaakPayCallbackResponse } from 'src/constant';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(PaymentEntity)
    private paymentRepository: Repository<PaymentEntity>,
  ) {}
  async initiatePayment(createPaymentDto: CreatePaymentDto) {
    const newPayment = new PaymentEntity();
    Object.assign(newPayment, createPaymentDto);

    const paymentData = {
      paymentId: newPayment.paymentId,
      userId: newPayment.userId,
      amount: newPayment.amount,
      currency: newPayment.currency,
      userEmail: newPayment.userEmail,
      merchantId: newPayment.merchantId,
    };

    const checkSumString = this.getCheckSumString(paymentData);
    const checkSum = this.calculateCheckSum(checkSumString);

    try {
      const response = await axios.post(
        'https://api.zaakpay.com/upi/generateintent',
        {
          paymentData,
          checkSumString: this.getCheckSumString,
          checkSum: this.calculateCheckSum(checkSumString),
          merchantcallbackurl: 'https://localhost:3000/payment/callback',
        },
      );

      const responseData = response.data;
      if (responseData.success === true) {
        const paymentInstance = this.paymentRepository.create(newPayment);
        paymentInstance.upiIntentId = responseData.data.upiIntentId;
        await this.paymentRepository.save(paymentInstance);
        const deepLinkUri = responseData.data.deepLinkUri;
        return { url: deepLinkUri };
      } else {
        throw new Error(responseData.message);
      }
    } catch {
      throw new Error('Error Initiating Payment');
    }
  }

  async handlePaymentCallback(response: ZaakPayCallbackResponse) {
    const payment = await this.paymentRepository.findOne({
      where: {
        upiIntentId: response.upiIntentId,
      },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (response.status === 'SUCCESS') {
      payment.transactionId = response.transactionId;
      payment.paymentStatus = 'success';
      await this.paymentRepository.save(payment);
    } else if (response.status === 'FAILURE') {
      payment.paymentStatus = 'failure';
      await this.paymentRepository.save(payment);
    } else if (response.status === 'PENDING') {
      payment.paymentStatus = 'pending';
      await this.paymentRepository.save(payment);
    }

    return { message: 'Callback received' };
  }

  getCheckSumString(data): string {
    const checkSumString = `${data.paymentId}&${data.userId}&${data.amount}&${data.amount}&${data.currency}&${data.userEmail}&${data.merchantId}`;

    return checkSumString;
  }

  calculateCheckSum = (checkSumString: string) => {
    CryptoJS.HmacSHA256(checkSumString, zaakpay.secretKey);
  };
}
