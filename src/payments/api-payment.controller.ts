import { Controller, Post, Body, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { PaymentsService } from './payments.service';

@UseGuards(AuthenticatedGuard)
@Roles('user')
@Controller('api/payment')
export class ApiPaymentController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create')
  async createPayment(
    @Body()
    body: {
      courseId: string;
      paymentMethod: string; // 'Full Payment' | 'Installment'
      promoCode?: string;
      formData?: any;
    },
    @Res() res: Response,
    @Req() req: Request & { user?: any },
  ) {
    try {
      const { courseId, paymentMethod, promoCode, formData } = body;
      const userId = req.user?.id;

      if (!userId || !courseId || !paymentMethod) {
        return res
          .status(400)
          .json({ status: 'error', message: 'Data tidak lengkap' });
      }

      // Format formData to match the column names expected by PaymentsService
      const formattedFormData = formData
        ? {
            user_fullname: formData.fullName,
            user_email: formData.email,
            user_no: formData.whatsappNumber,
            referal_source: formData.source,
          }
        : undefined;

      const orderData = await this.paymentsService.createXenditInvoice(
        userId,
        String(courseId),
        paymentMethod,
        promoCode,
        formattedFormData,
      );

      if (orderData.process === 'approved') {
        // Redirect to success page for free courses
        return res.json({
          status: 'success',
          redirect_url: `/payment/history/${userId}`,
          message: 'Pendaftaran berhasil! Pembayaran gratis (100% diskon).',
        });
      }

      // Redirect to Xendit Invoice URL
      return res.json({
        status: 'success',
        redirect_url: orderData.invoice.xendit_invoice_url,
        message: 'Mengalihkan ke halaman pembayaran Xendit...',
      });
    } catch (error: any) {
      console.error('Xendit Order Error:', error);
      return res.status(400).json({
        status: 'error',
        message:
          error.message || 'Terjadi kesalahan saat memproses pembayaran.',
      });
    }
  }
}
