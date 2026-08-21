import { Controller, Post, Body, Headers, Param, Res, Req, Get, HttpCode, HttpStatus, HttpException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { InvoiceService } from './invoice.service';

@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post('webhook/xendit')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() payload: any, @Headers('x-callback-token') callbackToken: string) {
    try {
      await this.invoiceService.handleXenditWebhook(payload, callbackToken);
      return { status: 'success' };
    } catch (error) {
      console.error('Webhook Error:', error.message);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message || 'Internal Server Error');
    }
  }

  @Post('simulate-success/:no')
  async simulateSuccess(@Param('no') no: string, @Res() res: Response, @Req() req: Request) {
    try {
      const payment = await this.invoiceService.simulatePaymentSuccess(no);
      const course = await this.invoiceService.findCourseById(payment.course.id);
      return res.render('payments/index', {
        layout: 'main',
        user: req.user,
        course,
        autoStep: 3,
      });
    } catch (error) {
      return res.redirect('/');
    }
  }
}
