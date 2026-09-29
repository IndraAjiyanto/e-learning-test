import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  NotFoundException,
  UseGuards,
  UseInterceptors,
  Res,
  Req,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { flashToast, flashToastError } from 'src/common/utils/toast.util';
import { InvoiceService } from 'src/invoice/invoice.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { ValidateImage } from 'src/common/decorators/validate-image.decorator';
import { ValidateImageInterceptor } from 'src/common/interceptors/validate-image.interceptor';
import { multerConfigMemoryOnly } from 'src/common/config/multer.config';
import { PaymentSettingsService } from 'src/payment-settings/payment-settings.service';
import { InstallmentPaymentService } from 'src/installment_payment/installment-payment.service';

@UseGuards(AuthenticatedGuard)
@Controller('payment')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly invoiceService: InvoiceService,
    private readonly paymentSettingsService: PaymentSettingsService,
    private readonly installmentPaymentService: InstallmentPaymentService,
  ) {}

  // ======================== XENDIT REDIRECT PAGES ========================

  @Roles('user')
  @Get('success/:orderId')
  async paymentSuccess(
    @Param('orderId') orderId: string,
    @Res() res: Response,
    @Req() req: Request & { user?: any },
  ) {
    try {
      // Pembayaran cicilan bulanan (table installment_payments)
      const installment =
        await this.paymentsService.getInstallmentPaymentByNo(orderId);
      if (installment) {
        if (
          installment.status !== 'approved' &&
          installment.xendit_invoice_id
        ) {
          const xenditStatus = await this.invoiceService.getXenditInvoiceStatus(
            installment.xendit_invoice_id,
          );
          if (
            xenditStatus &&
            (xenditStatus.status === 'PAID' ||
              xenditStatus.status === 'SETTLED')
          ) {
            installment.status = 'approved';
            installment.paidAt = xenditStatus.paidAt || new Date();
            await this.paymentsService.updateInstallmentPayment(installment);
          }
        }
        return res.redirect('/users/profile?tab=history-payment#installment');
      }

      const order = await this.paymentsService.getPaymentByNo(orderId);
      if (!order) {
        req.flash('error', 'Order tidak ditemukan.');
        return res.redirect('/');
      }

      const course = order.course;

      // Verifikasi status aktual dari Xendit sebelum mengonfirmasi pembayaran
      if (order.process !== 'approved') {
        await this.invoiceService
          .settleStuckPayment(order.id)
          .catch(() => undefined);
        const refreshed = await this.paymentsService.getPaymentByNo(orderId);
        if (refreshed) {
          Object.assign(order, refreshed);
        }
      }

      res.render('payments/index', {
        layout: 'main',
        title: 'Pembayaran Berhasil',
        order,
        course,
        user: req.user,
        autoStep: 3,
        success: req.flash('success'),
        error: req.flash('error'),
      });
    } catch (error: any) {
      req.flash('error', 'Terjadi kesalahan.');
      res.redirect('/');
    }
  }

  @Roles('user')
  @Get('failed/:orderId')
  async paymentFailed(
    @Param('orderId') orderId: string,
    @Res() res: Response,
    @Req() req: Request & { user?: any },
  ) {
    try {
      const order = await this.paymentsService.getPaymentByNo(orderId);
      res.render('payments/failed', {
        layout: 'main',
        title: 'Pembayaran Gagal',
        order,
        user: req.user,
        success: req.flash('success'),
        error: req.flash('error'),
      });
    } catch (error: any) {
      req.flash('error', 'Terjadi kesalahan.');
      res.redirect('/');
    }
  }

  // Simulasi webhook (khusus localhost / test mode)
  @Roles('user')
  @Roles('user')
  @Post(':userId/:courseId')
  async create(
    @Param('userId') userId: string,
    @Param('courseId') courseId: string,
    @Body() body: any,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const paymentMethod = body.paymentMethod || 'XENDIT_UI';
      const orderData = await this.paymentsService.createXenditInvoice(
        userId,
        String(courseId),
        paymentMethod,
        undefined, // promoCode
        body, // kirim sisa form data ke service
      );

      if (orderData.process === 'approved') {
        flashToast(
          req,
          'Registration complete',
          'Your place is confirmed - the program is open in My Learning.',
        );
        // Dulu mengarah ke /payment/history/:userId - halaman lama yang memakai
        // navbar publik dan tiga sub-tab, bukan tab Payment History yang kini
        // dipakai area student. Semua pengalihan di berkas ini ikut dipindah.
        return res.redirect('/users/profile?tab=history-payment');
      }

      return res.redirect(orderData.invoice.xendit_invoice_url);
    } catch (error: any) {
      req.flash('error', error.message || 'Payment initiation failed');
      return res.redirect(`/payment/detail/${courseId}`);
    }
  }

  // ======================== MANUAL PAYMENT (BANK TRANSFER) ========================
  // Jalur paralel: pembayaran manual verifikasi super admin. Semua rute memakai
  // pola upload yang sama dengan cicilan bulanan, dan kode Xendit tidak disentuh.
  //
  // PENTING: rute literal '/manual' WAJIB berada sebelum rute param
  // ':installmentsId'. Express mencocokkan rute sesuai urutan deklarasi, jadi
  // tanpa urutan ini POST /manual akan tertelan route DP (installmentsId
  // menjadi 'manual') dan bukti pembayaran Full manual gagal dikirim.

  @Roles('user')
  @Post(':userId/:courseId/manual')
  @UseInterceptors(
    FileInterceptor('file', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'payment',
  })
  async createManualFullPayment(
    @Param('userId') userId: string,
    @Param('courseId') courseId: string,
    @Body() body: any,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    // Di luar try supaya file yang sudah terunggah tetap bisa dibersihkan
    // di cabang catch. Kalau file meninggal di storage setiap kali upload
    // gagal, foldernya akan penuh file yatim.
    let uploadedFile: string | undefined;
    try {
      const { manual_enabled } = await this.paymentSettingsService.effective();
      if (!manual_enabled) {
        flashToastError(
          req,
          'Method inactive',
          'Manual payment is currently disabled.',
        );
        return res.redirect('/users/profile?tab=history-payment');
      }

      const dto = new CreatePaymentDto();
      dto.file = req.body.uploadedImageUrls?.[0];
      uploadedFile = dto.file;
      dto.courseId = courseId;
      dto.userId = userId;
      dto.process = 'process';
      dto.no = 'MANF-' + Date.now();
      const validSources = [
        'Instagram',
        'TikTok',
        'LinkedIn',
        'Friends',
        'University',
        'WhatsApp Group',
        'Webinar/Event',
        'Website',
        'Other',
      ];
      dto.referalSource = validSources.includes(body.source)
        ? body.source
        : 'Other';
      (dto as any).user_fullname = body.fullName;
      (dto as any).user_email = body.email;
      (dto as any).user_no = body.whatsappNumber;

      const result = await this.paymentsService.create(dto);
      if (!result) {
        // Bukti yang sudah terunggah tidak terpakai, jadi jangan ditinggalkan
        // di storage.
        await this.paymentsService.deleteFile(uploadedFile);
        uploadedFile = undefined;
        flashToastError(
          req,
          'Proof not submitted',
          result === false
            ? 'You already have an active payment for this program.'
            : 'Payment data is incomplete or invalid.',
        );
        return res.redirect('/users/profile?tab=history-payment');
      }

      flashToast(
        req,
        'Proof submitted',
        'Your payment proof is being reviewed by the admin.',
      );
      return res.redirect('/users/profile?tab=history-payment');
    } catch (error: any) {
      if (uploadedFile) {
        await this.paymentsService.deleteFile(uploadedFile);
      }
      flashToastError(
        req,
        'Proof not submitted',
        error.message || 'Please try again in a moment.',
      );
      return res.redirect('/users/profile?tab=history-payment');
    }
  }

  // Upload ulang bukti pembayaran manual untuk Full Payment & DP Installment.
  // Payment diambil dari record yang sudah ada, user selalu dari session sehingga
  // tidak bisa meng-upload bukti milik user lain. Route ini harus didaftarkan
  // sebelum ':userId/:courseId/:installmentsId' karena tiga segment-nya akan
  // ditelan route generik itu kalau didaftarkan belakangan.
  @Roles('user')
  @Post('manual/reupload/:paymentId')
  @UseInterceptors(
    FileInterceptor('file', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'payment',
  })
  async reuploadManualProof(
    @Param('paymentId') paymentId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    let uploadedFile: string | undefined;
    try {
      const { manual_enabled } = await this.paymentSettingsService.effective();
      if (!manual_enabled) {
        flashToastError(
          req,
          'Method inactive',
          'Manual payment is currently disabled.',
        );
        return res.redirect('/users/profile?tab=history-payment');
      }

      const file = req.body.uploadedImageUrls?.[0];
      uploadedFile = file;

      await this.paymentsService.reuploadManualProof(
        req.user!.id,
        paymentId,
        file,
      );

      flashToast(
        req,
        'Proof submitted',
        'Your payment proof is being reviewed by the admin.',
      );
      return res.redirect('/users/profile?tab=history-payment');
    } catch (error: any) {
      if (uploadedFile) {
        await this.paymentsService.deleteFile(uploadedFile);
      }
      flashToastError(
        req,
        'Proof not submitted',
        error.message || 'Please try again in a moment.',
      );
      return res.redirect('/users/profile?tab=history-payment');
    }
  }

  @Roles('user')
  @Post(':userId/:courseId/:installmentsId')
  @UseInterceptors(
    FileInterceptor('file', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'payment',
  })
  async createInstallmentPayment(
    @Param('installmentsId') installmentsId: string,
    @Param('userId') userId: string,
    @Param('courseId') courseId: string,
    @Body() createPaymentDto: CreatePaymentDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    // Di luar try supaya file yang sudah terunggah tetap bisa dibersihkan di
    // cabang catch. Lihat catatan di createManualFullPayment.
    let uploadedFile: string | undefined;
    try {
      const { manual_enabled } = await this.paymentSettingsService.effective();
      if (!manual_enabled) {
        flashToastError(
          req,
          'Method inactive',
          'Manual payment is currently disabled.',
        );
        return res.redirect('/users/profile?tab=history-payment');
      }

      createPaymentDto.installmentId = installmentsId;
      createPaymentDto.file = req.body.uploadedImageUrls?.[0];
      uploadedFile = createPaymentDto.file;
      createPaymentDto.courseId = courseId;
      createPaymentDto.userId = userId;
      createPaymentDto.process = 'process';
      if (!createPaymentDto.no) {
        createPaymentDto.no = 'MAND-' + Date.now();
      }

      const result = await this.paymentsService.create(createPaymentDto);
      if (!result) {
        await this.paymentsService.deleteFile(uploadedFile);
        uploadedFile = undefined;
        flashToastError(
          req,
          'Proof not submitted',
          result === false
            ? 'You already have an active payment for this program.'
            : 'Payment data is incomplete or invalid.',
        );
        return res.redirect('/users/profile?tab=history-payment');
      }

      flashToast(
        req,
        'Proof submitted',
        'Your payment proof is being reviewed by the admin.',
      );
      return res.redirect('/users/profile?tab=history-payment');
    } catch (error: any) {
      if (uploadedFile) {
        await this.paymentsService.deleteFile(uploadedFile);
      }
      flashToastError(
        req,
        'Proof not submitted',
        error.message || 'Please try again in a moment.',
      );
      return res.redirect('/users/profile?tab=history-payment');
    }
  }

  @Roles('user')
  @Post('manual/installment/:paymentId/:month')
  @UseInterceptors(
    FileInterceptor('file', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'payment',
  })
  async createManualInstallmentMonthPayment(
    @Param('paymentId') paymentId: string,
    @Param('month') month: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    // Di luar try supaya file yang sudah terunggah tetap bisa dibersihkan di
    // cabang catch, termasuk ketika payment ditolak karena sudah ada invoice
    // atau bukti transfer lain untuk bulan yang sama.
    let uploadedFile: string | undefined;
    try {
      const { manual_enabled } = await this.paymentSettingsService.effective();
      if (!manual_enabled) {
        flashToastError(
          req,
          'Method inactive',
          'Manual payment is currently disabled.',
        );
        return res.redirect('/users/profile?tab=history-payment');
      }

      const file = req.body.uploadedImageUrls?.[0];
      uploadedFile = file;
      await this.paymentsService.createManualInstallmentPayment(
        req.user!.id,
        paymentId,
        Number(month),
        file,
      );

      flashToast(
        req,
        'Proof submitted',
        'Your installment payment proof is being reviewed by the admin.',
      );
      return res.redirect('/users/profile?tab=history-payment');
    } catch (error: any) {
      if (uploadedFile) {
        await this.paymentsService.deleteFile(uploadedFile);
      }
      flashToastError(
        req,
        'Proof not submitted',
        error.message || 'Please try again in a moment.',
      );
      return res.redirect('/users/profile?tab=history-payment');
    }
  }

  // Approve / reject cicilan bulanan manual (super admin)
  @Roles('super_admin')
  @Patch('installment/:proses/:id')
  async updateManualInstallmentPayment(
    @Param('proses') proses: string,
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const row = await this.installmentPaymentService.findOneById(id);
      if (!row) {
        flashToastError(
          req,
          'Cicilan Tidak Ditemukan',
          'Data cicilan tidak ditemukan.',
        );
        return res.redirect('/program');
      }
      const approved = proses === 'approved';
      if (proses === 'approved') {
        row.status = 'approved';
        row.paidAt = new Date();
      } else if (proses === 'rejected') {
        row.status = 'rejected';
      } else {
        // Tanpa validasi ini, proses yang tidak dikenali jatuh ke save tanpa
        // mengubah apa-apa, lalu toast sukses berbunyi "Cicilan Ditolak".
        flashToastError(
          req,
          'Status Tidak Dikenali',
          `Status "${proses}" tidak dikenali.`,
        );
        return res.redirect('/program');
      }
      await this.installmentPaymentService.save(row);
      flashToast(
        req,
        approved ? 'Cicilan Disetujui' : 'Cicilan Ditolak',
        `Cicilan bulan ${row.month} telah ${approved ? 'disetujui' : 'ditolak'}.`,
      );
      const courseId = row.payment?.course?.id;
      if (courseId) {
        return res.redirect(`/program/detail/program/admin/${courseId}`);
      }
      return res.redirect('/program');
    } catch (error: any) {
      flashToastError(
        req,
        'Gagal Memperbarui Status Cicilan',
        error.message || 'Gagal memperbarui status cicilan.',
      );
      return res.redirect('/program');
    }
  }

  @Roles('user')
  @Get('api/payment/:userId')
  async getPayment(@Param('userId') userId: string, @Res() res: Response) {
    // Cek & perbarui status pembayaran full / DP yang masih menggantung ke Xendit
    await this.paymentsService
      .reconcileUserPayments(userId)
      .catch(() => undefined);
    const payment = await this.paymentsService.findPayment(userId);
    return res.json({ data: payment });
  }

  /**
   * Sumber tunggal untuk tab Payment History. Sengaja TIDAK menerima :userId di
   * path: id-nya diambil dari sesi, jadi endpoint ini tidak menambah lagi pola
   * IDOR yang masih ada di rute-rute lama di file ini.
   */
  @Roles('user')
  @Get('api/history')
  async getPaymentHistory(@Req() req: Request, @Res() res: Response) {
    if (!req.user) {
      return res.status(401).json({ data: [] });
    }
    const data = await this.paymentsService.findPaymentHistory(req.user.id);
    return res.json({ data });
  }

  @Roles('user')
  @Get('api/registration/:userId')
  async getRegistration(@Param('userId') userId: string, @Res() res: Response) {
    const registration = await this.paymentsService.findRegistration(userId);
    return res.json({ data: registration });
  }

  @Roles('user')
  @Get('api/installment/:userId')
  async getInstallment(@Param('userId') userId: string, @Res() res: Response) {
    const installments = await this.paymentsService.findInstallments(userId);
    return res.json({ data: installments });
  }

  @Roles('user')
  @Get('api/installment-detail/:userId')
  async getInstallmentDetail(
    @Param('userId') userId: string,
    @Res() res: Response,
  ) {
    const detail = await this.paymentsService.getUserInstallmentDetail(userId);
    return res.json({ data: detail });
  }

  @Roles('user')
  @Get('history/:userId')
  async riwayat(
    @Param('userId') userId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    res.render('user/riwayat', {
      user: req.user,
      userId,
    });
  }

  /**
   * Step 1 & 2 pendaftaran program.
   *
   * Pilihan metode pembayaran sudah ditentukan SEBELUM user masuk ke sini, di
   * kartu harga pada halaman program: tab `Full Payment` mengirim
   * `?method=full`, tab `Installment` mengirim `?method=installment`
   * (components/ui/card/pricing_card). Jadi step 2 tidak lagi menanyakan
   * metode lagi - user hanya membayar lewat jalan yang sudah dia pilih.
   *
   * Aturan penentuannya:
   * - Hanya `full` & `installment` yang diterima. Tanpa parameter, atau
   *   nilai lain, jatuh ke Full Payment (default kartu harga `tab: 'full'`),
   *   jadi keempat pintu masuk yang tidak mengirim parameter tetap punya
   *   perilaku yang sama.
   * - `installment` hanya sah bila programnya benar-benar punya rencana
   *   cicilan dengan DP > 0. Kalau tidak, jatuh ke Full Payment tanpa pesan:
   *   menekan tab Installment di program tanpa cicilan bukan kondisi yang
   *   perlu dijelaskan, dan user tetap bisa membayar lewat Full.
   */
  @Roles('user')
  @Get('registration/:courseId')
  async registrationPage(
    @Param('courseId') courseId: string,
    @Query('method') method: string | undefined,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const course = await this.paymentsService.findCourse(courseId);
    if (!course) {
      throw new NotFoundException('Program tidak ditemukan');
    }

    const firstInstallment = course.installments?.[0];
    const hasInstallmentPlan =
      !!firstInstallment && Number(firstInstallment.downPayment) > 0;
    const wantsInstallment =
      String(method ?? '').toLowerCase() === 'installment';

    const paymentMethod =
      wantsInstallment && hasInstallmentPlan
        ? 'Installment'
        : 'Full Payment';

    const paymentSettings = await this.paymentSettingsService.effective();
    res.render('payments/index', {
      user: req.user,
      course,
      paymentSettings,
      paymentMethod,
    });
  }

  @Roles('super_admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    const payment = await this.paymentsService.findAll();
    const registration = await this.paymentsService.findAllRegistrations();
    const installments = await this.paymentsService.findAllInstallments();
    res.render('super_admin/payments/index', {
      user: req.user,
      payment,
      registration,
      installments,
    });
  }

  @Roles('super_admin')
  @Get(':paymentId')
  async findPaymentDetails(
    @Param('paymentId') paymentId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const payment = await this.paymentsService.findOne(paymentId);
    res.render('super_admin/payments/detail', { user: req.user, payment });
  }

  /**
   * Verifikasi payment utama (Full Payment / DP) oleh super admin.
   *
   * Catatan body: PATCH dari Alpine (fetch tanpa body & tanpa Content-Type) TIDAK
   * membuat Express 5 + body-parser 2 menginisialisasi req.body, sehingga
   * `@Body()` bisa `undefined` dan `dto.file = ...` melempar TypeError
   * "Cannot set properties of undefined (setting 'file')". Semua field di bawah
   * selalu diisi dari payment yang sudah diambil, jadi DTO kosong tidak masalah.
   */
  @Roles('super_admin')
  @Patch(':proses/:paymentId')
  async update(
    @Param('paymentId') paymentId: string,
    @Param('proses') proses: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const dto = (updatePaymentDto || {}) as UpdatePaymentDto;

    // Kembalikan super admin ke halaman tempat tombol ditekan (hanya satu origin),
    // supaya aksi dari daftar /payment atau halaman detail tidak melempar ke
    // halaman program. Fallback: halaman detail program admin.
    const backTo = (courseId?: string | null) => {
      const referer = req.get('referer');
      if (referer) {
        try {
          const url = new URL(referer);
          if (url.host === req.headers.host) {
            return `${url.pathname}${url.search}`;
          }
        } catch (error) {}
      }
      return courseId
        ? `/program/detail/program/admin/${courseId}`
        : '/program';
    };

    try {
      const payment = await this.paymentsService.findOne(paymentId);
      if (!payment) {
        flashToastError(
          req,
          'Pembayaran Tidak Ditemukan',
          'Data pembayaran tidak ditemukan.',
        );
        return res.redirect('/payment');
      }

      const userId = payment.user?.id;
      const courseId = payment.course?.id;
      if (!userId || !courseId) {
        flashToastError(
          req,
          'Data Pembayaran Tidak Lengkap',
          'Pembayaran tidak terhubung ke user atau program.',
        );
        return res.redirect(backTo(courseId));
      }
      if (proses !== 'approved' && proses !== 'rejected') {
        flashToastError(
          req,
          'Status Tidak Dikenali',
          `Status "${proses}" tidak dikenali.`,
        );
        return res.redirect(backTo(courseId));
      }

      dto.file = payment.file;
      dto.userId = userId;
      dto.courseId = courseId;
      dto.process = proses;
      await this.paymentsService.update(paymentId, dto);

      if (proses === 'approved') {
        try {
          await this.paymentsService.addUserToCourse(userId, courseId);
        } catch (error: any) {
          // Sudah ikut program / data bermasalah: status payment tetap approved.
          console.warn(
            'Payment approved tapi user belum masuk program:',
            error?.message ?? error,
          );
        }
        flashToast(
          req,
          'Pembayaran Disetujui',
          'Status pembayaran telah diubah menjadi approved.',
        );
      } else {
        try {
          await this.paymentsService.removeCourseUser(userId, courseId);
        } catch (error: any) {
          // Belum pernah ikut program: status payment tetap rejected.
          console.warn(
            'Payment rejected tapi user tidak terdaftar di program:',
            error?.message ?? error,
          );
        }
        flashToast(
          req,
          'Pembayaran Ditolak',
          'Status pembayaran telah diubah menjadi rejected.',
        );
      }
      return res.redirect(backTo(courseId));
    } catch (error: any) {
      console.error('Gagal memperbarui status payment:', error);
      const payment = await this.paymentsService.findOne(paymentId);
      flashToastError(
        req,
        'Gagal Memperbarui Status Pembayaran',
        error?.message || 'Gagal memperbarui status pembayaran.',
      );
      return res.redirect(backTo(payment?.course?.id));
    }
  }
}
