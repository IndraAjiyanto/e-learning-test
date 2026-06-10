import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  UseInterceptors,
  Res,
  Req,
} from '@nestjs/common';
import { PembayaransService } from './pembayarans.service';
import { CreatePembayaranDto } from './dto/create-pembayaran.dto';
import { UpdatePembayaranDto } from './dto/update-pembayaran.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { ValidateImage } from 'src/common/decorators/validate-image.decorator';
import { ValidateImageInterceptor } from 'src/common/interceptors/validate-image.interceptor';
import { multerConfigMemoryOnly } from 'src/common/config/multer.config';

@UseGuards(AuthenticatedGuard)
@Controller('payment')
export class PembayaransController {
  constructor(private readonly pembayaransService: PembayaransService) {}

  @Roles('user')
  @Post(':userId/:kelasId')
  @UseInterceptors(
    FileInterceptor('file', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'payment',
  })
  async create(
    @Param('userId') userId: number,
    @Param('kelasId') kelasId: number,
    @Body() createPembayaranDto: CreatePembayaranDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createPembayaranDto.file = req.body.uploadedImageUrls?.[0];
      createPembayaranDto.kelasId = kelasId;
      createPembayaranDto.userId = userId;
      createPembayaranDto.proses = 'proces';
      const pembayaran =
        await this.pembayaransService.create(createPembayaranDto);
      if (pembayaran == false) {
        await this.pembayaransService.deleteFile(createPembayaranDto.file);
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
  @Post(':userId/:kelasId/:cicilanId')
  @UseInterceptors(
    FileInterceptor('file', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'payment',
  })
  async createPembayaranCicilan(
    @Param('cicilanId') cicilanId: number,
    @Param('userId') userId: number,
    @Param('kelasId') kelasId: number,
    @Body() createPembayaranDto: CreatePembayaranDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createPembayaranDto.cicilanId = cicilanId;
      createPembayaranDto.file = req.body.uploadedImageUrls?.[0];
      createPembayaranDto.kelasId = kelasId;
      createPembayaranDto.userId = userId;
      createPembayaranDto.proses = 'proces';
      const pembayaran =
        await this.pembayaransService.create(createPembayaranDto);
      if (pembayaran == false) {
        await this.pembayaransService.deleteFile(createPembayaranDto.file);
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
async getPayment(@Param('userId') userId: number, @Res() res: Response) {
  const pembayaran = await this.pembayaransService.findPembayaran(userId);
  return res.json({ data: pembayaran });
}

@Roles('user')
@Get('api/registration/:userId')
async getRegistration(@Param('userId') userId: number, @Res() res: Response) {
  const pendaftaran = await this.pembayaransService.findPendaftaran(userId);
  return res.json({ data: pendaftaran });
}

@Roles('user')
@Get('api/installment/:userId')
async getInstallment(@Param('userId') userId: number, @Res() res: Response) {
  const cicilan = await this.pembayaransService.findCicilan(userId);
  return res.json({ data: cicilan });
}

  @Roles('user')
  @Get('history/:userId')
  async riwayat(
    @Param('userId') userId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    res.render('user/riwayat', {
      user: req.user,
      userId
    });
  }

  @Roles('user')
  @Get('detail/:kelasId')
  async detail(
    @Param('kelasId') kelasId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const kelas = await this.pembayaransService.findKelas(kelasId);
    res.render('user/pembayaran', { user: req.user, kelas });
  }

  @Roles('super_admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    const pembayaran = await this.pembayaransService.findAll();
    const pendaftaran = await this.pembayaransService.findAllPendaftaran();
    const cicilan = await this.pembayaransService.findAllCicilan();
    res.render('super_admin/pembayaran/index', {
      user: req.user,
      pembayaran,
      pendaftaran,
      cicilan,
    });
  }

  @Roles('super_admin')
  @Get(':pembayaranId')
  async findOne(
    @Param('pembayaranId') pembayaranId: number,
    @Res() res: Response,
    @Req() req: any,
  ) {
    const pembayaran = await this.pembayaransService.findOne(pembayaranId);
    res.render('super_admin/pembayaran/detail', { user: req.user, pembayaran });
  }

  @Roles('super_admin')
  @Patch(':proses/:pembayaranId')
  async update(
    @Param('pembayaranId') pembayaranId: number,
    @Param('proses') proses: string,
    @Body() updatePembayaranDto: UpdatePembayaranDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const pembayaran = await this.pembayaransService.findOne(pembayaranId);
      if (!pembayaran) {
        return null;
      }
      if (proses === 'acc') {
        updatePembayaranDto.file = pembayaran['file'];
        updatePembayaranDto.userId = pembayaran['user']['id'];
        updatePembayaranDto.kelasId = pembayaran['kelas']['id'];
        updatePembayaranDto.proses = 'acc';
        await this.pembayaransService.update(pembayaranId, updatePembayaranDto);
        try {
          await this.pembayaransService.addUserToKelas(
            pembayaran['user']['id'],
            pembayaran['kelas']['id'],
          );
        } catch (error: any) {}

        req.flash('success', 'proces successfully change acc');
        res.redirect(`/program/detail/program/admin/${pembayaran['kelas']['id']}`);
      } else if (proses === 'rejected') {
        updatePembayaranDto.file = pembayaran['file'];
        updatePembayaranDto.userId = pembayaran['user']['id'];
        updatePembayaranDto.kelasId = pembayaran['kelas']['id'];
        updatePembayaranDto.proses = 'rejected';
        await this.pembayaransService.update(pembayaranId, updatePembayaranDto);
        try {
          await this.pembayaransService.removeUserKelas(
            pembayaran['user']['id'],
            pembayaran['kelas']['id'],
          );
        } catch (error: any) {}
        req.flash('success', 'proces successfully change rejected');
        res.redirect(`/program/detail/program/admin/${pembayaran['kelas']['id']}`);
      }
    } catch (error: any) {
      const pembayaran = await this.pembayaransService.findOne(pembayaranId);
      req.flash('error', error.message || 'Payment proof submission failed');
      res.redirect(`/program/detail/program/admin/${pembayaran['kelas']['id']}`);
    }
  }
}
