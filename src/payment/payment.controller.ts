import { Controller, Get, Body, Redirect, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ZaakPayCallbackResponse } from 'src/constant';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('initiate')
  async initiate(@Body() createPaymentDto: CreatePaymentDto) {
    return await this.paymentService.initiatePayment(createPaymentDto);
  }

  @Post('callback')
  async handlePaymentCallback(@Body() response: any) {
    return await this.paymentService.handlePaymentCallback(response);
  }

  @Get('checksum')
  async getCheckSum() {
    return await this.paymentService.getCheckSum();
  }
}
