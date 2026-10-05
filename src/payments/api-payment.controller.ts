import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
  Patch,
  Get,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { PaymentsService } from './payments.service';
import { PaymentSettingsService } from 'src/payment-settings/payment-settings.service';
import { isReferalSource } from 'src/entities/types/referal-source';

@UseGuards(AuthenticatedGuard)
@Roles('user')
@Controller('api/payment')
export class ApiPaymentController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paymentSettingsService: PaymentSettingsService,
  ) {}

  // `refresh()` di panel admin memakai endpoint ini untuk mencerminkan state
  // tersimpan kembali ke UI, dan modal cicilan di history payment user juga
  // memakainya untuk menentukan tombol kanal mana yang ditampilkan. Dua role
  // diizinkan: super admin untuk panel, user untuk memilih kanal pembayaran.
  @Roles('user', 'super_admin')
  @Get('settings')
  async getSettings(@Res() res: Response) {
    const settings = await this.paymentSettingsService.effective();
    return res.json({ status: 'success', data: settings });
  }

  /**
   * Mengubah kanal pembayaran aktif (hanya satu boleh aktif; aturan exclusivity
   * ditegakkan di PaymentSettingsService.update).
   *
   * Menyimpan `data` dari hasil `effective()`, bukan entitas mentah: supaya
   * yang tampil di UI persis sama dengan yang dipakai guard, termasuk saat
   * Xendit otomatis dinonaktifkan karena kunci belum dikonfigurasi.
   */
  @Roles('super_admin')
  @Patch('settings')
  async updateSettings(
    @Body() body: { manualEnabled?: boolean; gatewayEnabled?: boolean },
    @Res() res: Response,
  ) {
    const manualEnabled = body?.manualEnabled;
    const gatewayEnabled = body?.gatewayEnabled;

    if (
      typeof manualEnabled !== 'boolean' &&
      typeof gatewayEnabled !== 'boolean'
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'Tidak ada perubahan untuk disimpan.',
      });
    }

    // Penjaga bila endpoint dipanggil langsung (UI sudah menonaktifkan pilihan
    // ini): gateway tidak bisa dinyalakan tanpa kunci Xendit.
    if (gatewayEnabled === true && !process.env.XENDIT_SECRET_KEY) {
      return res.status(400).json({
        status: 'error',
        message:
          'XENDIT_SECRET_KEY belum dikonfigurasi — gateway tidak bisa diaktifkan.',
      });
    }

    const patch: any = {};
    if (typeof manualEnabled === 'boolean') {
      patch.manual_enabled = manualEnabled;
    }
    if (typeof gatewayEnabled === 'boolean') {
      patch.gateway_enabled = gatewayEnabled;
    }

    await this.paymentSettingsService.update(patch);
    const data = await this.paymentSettingsService.effective();
    return res.json({
      status: 'success',
      message: 'Kanal pembayaran diperbarui.',
      data,
    });
  }

  @Post('create')
  async createPayment(
    @Body()
    body: {
      courseId: string;
      paymentMethod: string; // 'Full Payment' | 'Installment'
      promoCode?: string;
      // Bentuknya sama dengan draft yang disimpan registration.hbs di
      // localStorage, lalu dikirim paymentMethod.hbs. Semuanya opsional karena
      // field form memang bisa kosong, dan `source` tetap harus diperiksa
      // ulang sebelum menyentuh kolom enum `referalSource`.
      formData?: {
        fullName?: string;
        email?: string;
        whatsappNumber?: string;
        source?: string;
      };
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

      const { gateway_enabled } = await this.paymentSettingsService.effective();
      if (!gateway_enabled) {
        return res.status(400).json({
          status: 'error',
          message: 'Metode pembayaran gateway sedang nonaktif.',
        });
      }

      // Format formData to match the column names expected by PaymentsService
      const formattedFormData = formData
        ? {
            user_fullname: formData.fullName,
            user_email: formData.email,
            user_no: formData.whatsappNumber,
            // `source` datang dari select di form, jadi nilainya bisa saja bukan
            // member enum - localStorage pun bisa disunting manual, dan form
            // pernah mengirim "Social Media" yang tidak ada di enum. Tanpa
            // penjaga di sini, INSERT ditolak Postgres dan user ikut gagal
            // bayar dengan pesan "Terjadi kesalahan saat memproses pembayaran."
            // Kolomnya nullable, jadi lebih baik null daripada menggagalkan
            // seluruh pembayaran karena satu field.
            referal_source: isReferalSource(formData.source)
              ? formData.source
              : null,
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
          redirect_url: '/users/profile?tab=history-payment',
          message: 'Pendaftaran berhasil! Pembayaran gratis (100% diskon).',
        });
      }

      // Redirect to Xendit Invoice URL
      const invoiceUrl = orderData.invoice?.xendit_invoice_url;
      if (!invoiceUrl) {
        return res.status(400).json({
          status: 'error',
          message: 'Invoice belum siap. Silakan coba lagi beberapa saat.',
        });
      }

      return res.json({
        status: 'success',
        redirect_url: invoiceUrl,
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

  @Post('installment-month')
  async createInstallmentMonthPayment(
    @Body()
    body: {
      paymentId: string;
      month: number;
    },
    @Res() res: Response,
    @Req() req: Request & { user?: any },
  ) {
    try {
      const userId = req.user?.id;
      const { paymentId, month } = body;

      if (!userId || !paymentId || !month) {
        return res
          .status(400)
          .json({ status: 'error', message: 'Data tidak lengkap' });
      }

      const { gateway_enabled } = await this.paymentSettingsService.effective();
      if (!gateway_enabled) {
        return res.status(400).json({
          status: 'error',
          message: 'Metode pembayaran gateway sedang nonaktif.',
        });
      }

      const orderData =
        await this.paymentsService.createMonthlyInstallmentInvoice(
          userId,
          String(paymentId),
          Number(month),
        );

      // Invoice bulan ini masih PENDING: arahkan balik ke invoice yang sama,
      // jangan buat invoice kedua untuk bulan yang sama.
      if ('blocked' in orderData) {
        return res.json({
          status: 'success',
          redirect_url: orderData.existingInvoiceUrl,
          message: orderData.message,
        });
      }

      return res.json({
        status: 'success',
        redirect_url: orderData.xendit_invoice_url,
        message: 'Mengalihkan ke halaman pembayaran cicilan Xendit...',
      });
    } catch (error: any) {
      console.error('Installment Month Payment Error:', error);
      return res.status(400).json({
        status: 'error',
        message: error.message || 'Terjadi kesalahan saat bayar cicilan.',
      });
    }
  }
}
