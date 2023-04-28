import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import * as CryptoJS from 'crypto-js';
import { zaakpay } from 'src/config/zaakpay.config';
import { PaymentEntity } from './entities/payment.entity';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { request } from 'http';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(PaymentEntity)
    private paymentRepository: Repository<PaymentEntity>,
  ) {}
  async initiatePayment(createPaymentDto: CreatePaymentDto) {
    const requestData = {
      orderDetail: {
        orderId: 'order1',
        amount: createPaymentDto.amount,
        currency: 'INR',
        productDescription: createPaymentDto.schemeId,
        email: zaakpay.userEmail,
      },
      paymentInstrument: {
        paymentMode: 'UPIAPP',
        netbanking: { bankid: '' },
      },
      returnUrl:
        'https://zaakpay-integration-test.onrender.com/payment/callback',
    };

    console.log(
      `requestData: ${requestData.orderDetail}, ${requestData.paymentInstrument}, ${requestData.returnUrl}`,
    );

    const checkSum = this.calculateCheckSum(requestData);
    console.log(`checksum: ${checkSum}`);

    try {
      const response = await axios.post(
        'https://zaakstaging.zaakpay.com/transactU?v=8',
        {
          data: JSON.stringify(requestData),
          checkSum: checkSum,
        },
      );

      console.log(`response: ${response.data}`);

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

  calculateCheckSum(requestData) {
    const checkSumString = JSON.stringify(requestData);
    console.log(`checkSumString: ${checkSumString}`);
    return CryptoJS.HmacSHA256(checkSumString, zaakpay.secretKey);
  }

  getCheckSum() {
    const requestData = {
      merchantIdentifier: 'b19e8f103bce406cbd3476431b6b7973',
      showMobile: 'true',
      mode: '0',
      returnUrl:
        'https://zaakstaging.zaakpay.com/api/automation/v1/payment/response',
      orderDetail: {
        orderId: 'ZP-Stag-15841047222321',
        amount: '100',
        currency: 'INR',
        productDescription: 'Test Automation',
        email: 'deepanshu.gehlot@mobikwik.com',
        phone: '9999999999',
        extra1: 'udf1',
        extra2: 'udf2',
        extra3: 'udf3',
        extra4: 'udf4',
        extra5: 'udf5',
        product1Description: 'pd1',
        product2Description: 'pd2',
        product3Description: 'pd3',
        product4Description: 'pd4',
        firstName: 'Test_Fir',
        lastName: 'Test_Las',
      },
      paymentInstrument: { paymentMode: 'UPIAPP', netbanking: { bankid: '' } },
      billingAddress: { city: 'Gurgaon' },
      shippingAddress: { city: 'Gurgaon' },
    };

    const checkSumString = JSON.stringify(requestData);
    console.log(checkSumString);
    const checkSum = CryptoJS.HmacSHA256(checkSumString, zaakpay.secretKey);
    console.log(`checksum: ${checkSum}`);
  }
}
