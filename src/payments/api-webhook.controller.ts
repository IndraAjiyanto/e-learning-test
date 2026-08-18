import { Controller, Post, Body, Req, Res, Headers } from '@nestjs/common';
import { Request, Response } from 'express';
import { PaymentsService } from './payments.service';

@Controller('api/webhook')
export class ApiWebhookController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('xendit')
  async handleXenditWebhook(
    @Headers('x-callback-token') callbackToken: string,
    @Body() body: any,
    @Res() res: Response
  ) {
    // Validate Xendit Callback Token
    // You should set XENDIT_WEBHOOK_TOKEN in your .env
    const expectedToken = process.env.XENDIT_WEBHOOK_TOKEN;
    if (expectedToken && callbackToken !== expectedToken) {
      return res.status(403).json({ status: 'error', message: 'Invalid callback token' });
    }

    try {
      await this.paymentsService.handleXenditWebhook(body, callbackToken);
      return res.status(200).json({ status: 'success' });
    } catch (error: any) {
      console.error('Webhook Error:', error);
      // Still return 200 to Xendit so they don't retry forever for logic errors,
      // but in a real production app you might return 500 for actual DB failures.
      return res.status(200).json({ status: 'error', message: error.message });
    }
  }
}
