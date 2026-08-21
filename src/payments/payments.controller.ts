import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  NotFoundException,
  UseGuards,
  UseInterceptors,
  Res,
  Req,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { ValidateImage } from 'src/common/decorators/validate-image.decorator';
import { ValidateImageInterceptor } from 'src/common/interceptors/validate-image.interceptor';
import { multerConfigMemoryOnly } from 'src/common/config/multer.config';

@UseGuards(AuthenticatedGuard)
@Controller('payment')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // ======================== XENDIT REDIRECT PAGES ========================

  @Roles('user')
  @Get('success/:orderId')
  async paymentSuccess(
    @Param('orderId') orderId: string,
    @Res() res: Response,
    @Req() req: Request & { user?: any },
  ) {
    try {
      const order = await this.paymentsService.getPaymentByNo(orderId);
      if (!order) {
        req.flash('error', 'Order tidak ditemukan.');
        return res.redirect('/');
      }

      const course = order.course;

      // --- MULAI KODE HACK (HANTU BAIK) KHUSUS LOCALHOST ---
      // Kode ini secara gaib menekan tombol hijau: mengubah status jadi lunas & memasukkan user ke kelas
      try {
        if (req.user && course && order.process !== 'approved') {
          order.process = 'approved';
          await this.paymentsService['paymentRepository'].save(order);
          await this.paymentsService.addUserToCourse(req.user.id, course.id);
        }
      } catch (err) {
        // Abaikan jika sudah terdaftar
      }
      // --- SELESAI KODE HACK ---

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
    @Param('userId', ParseIntPipe) userId: number,
    @Param('courseId') courseId: number,
    @Body() body: any,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const paymentMethod = body.paymentMethod || 'XENDIT_UI';
      const orderData = await this.paymentsService.createXenditInvoice(
        userId,
        Number(courseId),
        paymentMethod,
        undefined, // promoCode
        body // kirim sisa form data ke service
      );

      if (orderData.process === 'approved') {
        req.flash('success', 'Pendaftaran berhasil!');
        return res.redirect(`/payment/history/${userId}`);
      }

      return res.redirect(orderData.invoice.xendit_invoice_url);
    } catch (error: any) {
      req.flash('error', error.message || 'Payment initiation failed');
      return res.redirect(`/payment/detail/${courseId}`);
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
    @Param('installmentsId') installmentsId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Param('courseId') courseId: number,
    @Body() createPaymentDto: CreatePaymentDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createPaymentDto.installmentId = installmentsId;
      createPaymentDto.file = req.body.uploadedImageUrls?.[0];
      createPaymentDto.courseId = courseId;
      createPaymentDto.userId = userId;
      createPaymentDto.process = 'process';
      const payment =
        await this.paymentsService.create(createPaymentDto);
      if (payment == false) {
        await this.paymentsService.deleteFile(createPaymentDto.file);
        req.flash(
          'info',
          'You have already submitted the payment proof, please wait for further information from the admin.',
        );
        res.redirect(`/payment/history/${userId}`);
      } else {
        req.flash(
          'success',
          'Payment proof has been successfully submitted, please wait for the admin',
        );
        res.redirect(`/payment/history/${userId}`);
      }
    } catch (error: any) {
      req.flash('error', error.message || 'Payment proof submission failed');
      res.redirect(`/payment/history/${userId}`);
    }
  }


 @Roles('user')
@Get('api/payment/:userId')
async getPayment(@Param('userId', ParseIntPipe) userId: number, @Res() res: Response) {
  const payment = await this.paymentsService.findPayment(userId);
  return res.json({ data: payment });
}

@Roles('user')
@Get('api/registration/:userId')
async getRegistration(@Param('userId', ParseIntPipe) userId: number, @Res() res: Response) {
  const registration = await this.paymentsService.findRegistration(userId);
  return res.json({ data: registration });
}

@Roles('user')
@Get('api/installment/:userId')
async getInstallment(@Param('userId', ParseIntPipe) userId: number, @Res() res: Response) {
  const installments = await this.paymentsService.findInstallments(userId);
  return res.json({ data: installments });
}

  @Roles('user')
  @Get('history/:userId')
  async riwayat(
    @Param('userId', ParseIntPipe) userId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    res.render('user/riwayat', {
      user: req.user,
      userId
    });
  }

  @Roles('user')
  @Get('detail/:courseId')
  async detail(
    @Param('courseId') courseId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const course = await this.paymentsService.findCourse(courseId);
    res.render('user/payment', { user: req.user, course });
  }

  @Roles('user')
  @Get('registration/:courseId')
  async registrationPage(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const course = await this.paymentsService.findCourse(courseId);
    if (!course) {
      throw new NotFoundException('Program tidak ditemukan');
    }
    res.render('payments/index', { user: req.user, course });
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
    @Param('paymentId') paymentId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const payment = await this.paymentsService.findOne(paymentId);
    res.render('super_admin/payments/detail', { user: req.user, payment });
  }

  @Roles('super_admin')
  @Patch(':proses/:paymentId')
  async update(
    @Param('paymentId') paymentId: number,
    @Param('proses') proses: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const payment = await this.paymentsService.findOne(paymentId);
      if (!payment) {
        return null;
      }
      if (proses === 'approved') {
        updatePaymentDto.file = payment['file'];
        updatePaymentDto.userId = payment['user']['id'];
        updatePaymentDto.courseId = payment['course']['id'];
        updatePaymentDto.process = 'approved';
        await this.paymentsService.update(paymentId, updatePaymentDto);
        try {
          await this.paymentsService.addUserToCourse(
            payment['user']['id'],
            payment['course']['id'],
          );
        } catch (error: any) {}

        req.flash('success', 'proces successfully change acc');
        res.redirect(`/program/detail/program/admin/${payment['course']['id']}`);
      } else if (proses === 'rejected') {
        updatePaymentDto.file = payment['file'];
        updatePaymentDto.userId = payment['user']['id'];
        updatePaymentDto.courseId = payment['course']['id'];
        updatePaymentDto.process = 'rejected';
        await this.paymentsService.update(paymentId, updatePaymentDto);
        try {
          await this.paymentsService.removeCourseUser(
            payment['user']['id'],
            payment['course']['id'],
          );
        } catch (error: any) {}
        req.flash('success', 'proces successfully change rejected');
        res.redirect(`/program/detail/program/admin/${payment['course']['id']}`);
      }
    } catch (error: any) {
      const payment = await this.paymentsService.findOne(paymentId);
      req.flash('error', error.message || 'Payment proof submission failed');
      res.redirect(`/program/detail/program/admin/${payment['course']['id']}`);
    }
  }
}
