import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Req,
  UseInterceptors,
  UploadedFile,
  UseFilters,
  ParseIntPipe,
} from '@nestjs/common';
import { KelassService } from './kelass.service';
import { CreateKelassDto } from './dto/create-kelass.dto';
import { UpdateKelassDto } from './dto/update-kelass.dto';
import { Request, Response } from 'express';
import { Roles } from 'src/common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfigMemoryOnly } from 'src/common/config/multer.config';
import { ValidateImageInterceptor } from 'src/common/interceptors/validate-image.interceptor';
import { ValidateImage } from 'src/common/decorators/validate-image.decorator';
import { FileUploadExceptionFilter } from 'src/common/filters/file-upload-exception.filter';
import { MulterErrorInterceptor } from 'src/common/interceptors/multer-error.interceptor';

@UseFilters(FileUploadExceptionFilter)
@UseInterceptors(MulterErrorInterceptor)
@Controller('kelass')
export class KelassController {
  constructor(private readonly kelassService: KelassService) {}

  @Roles('admin', 'super_admin')
  @Post()
  @UseInterceptors(
    FileInterceptor('gambar', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 1900,
    maxWidth: 1920,
    minHeight: 1000,
    maxHeight: 1080,
    folder: 'program',
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
  })
  async create(
    @Body() createKelassDto: CreateKelassDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createKelassDto.gambar = req.body.uploadedImageUrls?.[0];

      if (createKelassDto.bulan) {
        createKelassDto.hari = 0;
      }

      if (createKelassDto.hari) {
        createKelassDto.bulan = 0;
      }

      if (createKelassDto.paid_check === 'true') {
        createKelassDto.form = '';
        createKelassDto.check_paid = true;
        if (req.user!.role === 'super_admin') {
          createKelassDto.proses = 'acc';
        } else if (req.user!.role === 'admin') {
          createKelassDto.proses = 'proces';
        }
      } else if (createKelassDto.paid_check === 'false') {
        createKelassDto.check_paid = false;
        createKelassDto.harga = 0;
        createKelassDto.promo = 0;
        if (req.user!.role === 'super_admin') {
          createKelassDto.proses = 'acc';
        } else if (req.user!.role === 'admin') {
          createKelassDto.proses = 'proces';
        }
      }
      const kelas = await this.kelassService.create(createKelassDto);
      if (req.user!.role === 'super_admin') {
        await this.kelassService.createMentoring(
          createKelassDto.mentoringId,
          kelas.id,
        );
      }
      if (req.user!.role === 'admin') {
        await this.kelassService.createMentoring(req.user!.id, kelas.id);
      }
      req.flash('success', 'program successfully created');
      res.redirect('/kelass');
    } catch (error) {
      req.flash('error', error.message || 'program failed created');
      res.redirect('/kelass');
    }
  }

  @Roles('admin', 'super_admin')
  @Post(':kategoriId')
  @UseInterceptors(
    FileInterceptor('gambar', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 1900,
    maxWidth: 1920,
    minHeight: 1000,
    maxHeight: 1080,
    folder: 'program',
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
  })
  async createKelas(
    @Body() createKelassDto: CreateKelassDto,
    @Res() res: Response,
    @Req() req: Request,
    @Param('kategoriId') kategoriId: number,
  ) {
    try {
      createKelassDto.gambar = req.body.uploadedImageUrls?.[0];

      if (createKelassDto.bulan) {
        createKelassDto.hari = 0;
      }

      if (createKelassDto.hari) {
        createKelassDto.bulan = 0;
      }

      if (createKelassDto.paid_check === 'true') {
        createKelassDto.form = '';
        createKelassDto.check_paid = true;
        if (req.user!.role === 'super_admin') {
          createKelassDto.proses = 'acc';
        } else if (req.user!.role === 'admin') {
          createKelassDto.proses = 'proces';
        }
      } else if (createKelassDto.paid_check === 'false') {
        createKelassDto.check_paid = false;
        createKelassDto.harga = 0;
        createKelassDto.promo = 0;
        if (req.user!.role === 'super_admin') {
          createKelassDto.proses = 'acc';
        } else if (req.user!.role === 'admin') {
          createKelassDto.proses = 'proces';
        }
      }
      createKelassDto.kategoriId = kategoriId;
      const kelas = await this.kelassService.create(createKelassDto);
      if (req.user!.role === 'super_admin') {
        await this.kelassService.createMentoring(
          createKelassDto.mentoringId,
          kelas.id,
        );
      }
      if (req.user!.role === 'admin') {
        await this.kelassService.createMentoring(req.user!.id, kelas.id);
      }
      req.flash('success', 'program successfully created');
      res.redirect(`/category/${kategoriId}`);
    } catch (error) {
      req.flash('error', error.message || 'program failed created');
      res.redirect(`/category/${kategoriId}`);
    }
  }

  @Roles('admin', 'super_admin')
  @Post('tambahMurid/:kelasId')
  async addUserToKelas(
    @Param('kelasId') kelasId: number,
    @Res() res: Response,
    @Req() req: Request,
    @Body('userId') userId: number,
  ) {
    try {
      await this.kelassService.addUserToKelas(userId, kelasId);
      req.flash('success', 'user successfuly add to program');
      res.redirect(`/kelass/addUser/${kelasId}`);
    } catch (error) {
      req.flash('error', error.message || 'user failed add to program');
      res.redirect(`/kelass/addUser/${kelasId}`);
    }
  }

  @Roles('admin', 'super_admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    if (req.user!.role === 'super_admin') {
      const kelas = await this.kelassService.allKelas();
      res.render('admin/kelas/index', { user: req.user, kelas });
    } else if (req.user!.role === 'admin') {
      const kelas = await this.kelassService.findKelasByMentoring(req.user!.id);
      res.render('admin/kelas/index', { user: req.user, kelas });
    }
  }

  @Roles('admin', 'super_admin')
  @Get('/create')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    const kategori = await this.kelassService.findKategori();
    const jenis_kelas = await this.kelassService.findJenisKelas();
    const teknologi = await this.kelassService.findTeknologi();
    const mentoring = await this.kelassService.findMentoring();
    return res.render('admin/kelas/create', {
      user: req.user,
      kategori,
      jenis_kelas,
      teknologi,
      mentoring,
    });
  }

  @Roles('super_admin')
  @Get('/formCreate/:kategoriId')
  async formCreateKelas(
    @Res() res: Response,
    @Req() req: Request,
    @Param('kategoriId') kategoriId: number,
  ) {
    const kategori = await this.kelassService.findOneKategori(kategoriId);
    const jenis_kelas = await this.kelassService.findJenisKelas();
    const teknologi = await this.kelassService.findTeknologi();
    const mentoring = await this.kelassService.findMentoring();
    return res.render('admin/kelas/formCreate', {
      user: req.user,
      jenis_kelas,
      teknologi,
      mentoring,
      kategori,
      kategoriId,
    });
  }

  @Roles('admin', 'super_admin')
  @Get('/addUser/:kelasId')
  async formAddUser(
    @Res() res: Response,
    @Req() req: Request,
    @Param('kelasId') kelasId: number,
  ) {
    const users = await this.kelassService.findUser();
    const murid = await this.kelassService.findMurid(kelasId);
    const kelas = await this.kelassService.findOne(kelasId);
    return res.render('admin/kelas/addUser', {
      user: req.user,
      kelas,
      users,
      murid,
    });
  }

  @Roles('admin', 'super_admin')
  @Get('/edit/:kelasId')
  async formEdit(
    @Res() res: Response,
    @Param('kelasId') kelasId: number,
    @Req() req: Request,
  ) {
    const kelas = await this.kelassService.findOne(kelasId);
    const kategori = await this.kelassService.findKategori();
    const jenis_kelas = await this.kelassService.findJenisKelas();
    const teknologi = await this.kelassService.findTeknologi();
    const mentoring = await this.kelassService.findMentoring();

    return res.render('admin/kelas/edit', {
      user: req.user,
      kelas,
      kategori,
      jenis_kelas,
      teknologi,
      mentoring,
    });
  }

  @Roles('admin', 'super_admin')
  @Get('/logbookMentor/:kelasId')
  async getLogbookMentor(
    @Param('kelasId') kelasId: number,
    @Res() res: Response,
  ) {
    const logbookMentor = await this.kelassService.findLogbookMentor(kelasId);
    res.json(logbookMentor);
  }

  @Roles('admin', 'super_admin')
  @Get('/logbookUser/:kelasId')
  async getLogbookUser(
    @Param('kelasId') kelasId: number,
    @Res() res: Response,
  ) {
    const logbookUser = await this.kelassService.findLogBookUser(kelasId);
    res.json(logbookUser);
  }

  @Roles('admin', 'super_admin')
  @Get('/mentorKelas/:kelasId')
  async getMentorKelas(
    @Param('kelasId') kelasId: number,
    @Res() res: Response,
  ) {
    const mentor = await this.kelassService.findMentorKelas(kelasId);
    res.json(mentor);
  }

  @Roles('admin')
  @Get('/minggu/:kelasId')
  async getMinggu(@Param('kelasId') kelasId: number, @Res() res: Response) {
    const minggu = await this.kelassService.findMingguKelas(kelasId);
    res.json(minggu);
  }

  @Roles('super_admin', 'admin')
  @Get('/userKelas/:kelasId')
  async getUserKelas(@Param('kelasId') kelasId: number, @Res() res: Response) {
    const user_kelas = await this.kelassService.findUserKelas(kelasId);
    res.json(user_kelas);
  }

  @Roles('super_admin')
  @Get('/installment/:kelasId')
  async getCicilan(@Param('kelasId') kelasId: number, @Res() res: Response) {
    const availableMonths = await this.kelassService.findNo(kelasId);
    const cicilan = await this.kelassService.findCicilanKelas(kelasId);
    res.json({ availableMonths, cicilan });
  }

  @Roles('super_admin')
  @Get('/register/:kelasId')
  async getPendaftaran(
    @Param('kelasId') kelasId: number,
    @Res() res: Response,
  ) {
    const pendaftaran = await this.kelassService.findPendaftaranKelas(kelasId);
    res.json(pendaftaran);
  }

  @Roles('super_admin')
  @Get('/paymentInstallment/:kelasId')
  async getPaymentInstallment(
    @Param('kelasId') kelasId: number,
    @Res() res: Response,
  ) {
    const paymentInstallment =
      await this.kelassService.findPaymentInstallmentKelas(kelasId);
    res.json(paymentInstallment);
  }

  @Roles('super_admin')
  @Get('/benefit/:kelasId')
  async getBenefitKelas(
    @Param('kelasId') kelasId: number,
    @Res() res: Response,
  ) {
    const benefit_kelas = await this.kelassService.findBenefitKelas(kelasId);
    res.json(benefit_kelas);
  }

  @Roles('super_admin')
  @Get('/faq/:kelasId')
  async getPertanyaanKelas(
    @Param('kelasId') kelasId: number,
    @Res() res: Response,
  ) {
    const pertanyaan_kelas =
      await this.kelassService.findPertanyaanKelas(kelasId);
    res.json(pertanyaan_kelas);
  }

  @Roles('super_admin')
  @Get('/flow/:kelasId')
  async getAlurKelas(@Param('kelasId') kelasId: number, @Res() res: Response) {
    const alur_kelas = await this.kelassService.findAlurKelas(kelasId);
    res.json(alur_kelas);
  }

  @Roles('super_admin')
  @Get('/payment/:kelasId')
  async getPembayaran(@Param('kelasId') kelasId: number, @Res() res: Response) {
    const pembayaran = await this.kelassService.findPembayaranKelas(kelasId);
    res.json(pembayaran);
  }

  @Roles('super_admin')
  @Get('/alumni/:kelasId')
  async getAlumni(@Param('kelasId') kelasId: number, @Res() res: Response) {
    const alumni = await this.kelassService.findAlumniKelas(kelasId);
    res.json(alumni);
  }

  @Roles('admin', 'super_admin')
  @Get('/detail/kelas/admin/:kelasId')
  async detailKelas(
    @Param('kelasId', ParseIntPipe) kelasId: number,

    @Res() res: Response,
    @Req() req: Request,
  ) {
    if (req.user!.role === 'admin') {
      const kelas = await this.kelassService.findOneKelasAdmin(kelasId);
      const mingguTerakhir =
        await this.kelassService.findMingguTerakhir(kelasId);
      res.render('admin/kelas/detail', {
        user: req.user,
        kelas,
        mingguTerakhir,
      });
    } else if (req.user!.role === 'super_admin') {
      const kelas = await this.kelassService.findOne(kelasId);
      res.render('admin/kelas/detail', {
        user: req.user,
        kelas,
      });
    }
  }

  @Roles('user')
  @Get('kelas_saya/:id')
  async myCourse(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const kelas = await this.kelassService.findMyCourse(id);
    const kategori = await this.kelassService.findKategoriMyProgram(id);
    const jenis_kelas = await this.kelassService.findJenisKelasMyProgram(id);
    res.render('user/mycourse', {
      kelas,
      user: req.user,
      kategori,
      jenis_kelas,
    });
  }

  @Roles('user')
  @Get('kelas/detail/:kelasId')
  async viewDetail(
    @Param('kelasId') kelasId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const kelas = await this.kelassService.findOneKelas(kelasId);
    const check_user = await this.kelassService.checkUserInKelas(
      kelas.id,
      req.user!.id,
    );
    const kelass = await this.kelassService.allClassExcept(kelas.id);
    const pertanyaan_kelas =
      await this.kelassService.findPertanyaanKelas(kelasId);
    const alur_kelas = await this.kelassService.findAlurKelas(kelasId);
    const mentor = await this.kelassService.findMentorKelas(kelasId);
    const benefit_kelas = await this.kelassService.findBenefitKelas(kelasId);
    const teknologi = await this.kelassService.findTeknologiKelas(kelasId);
    const cicilan = await this.kelassService.findCicilanKelas(kelasId);
    res.render('kelas/Bdetail', {
      kelas,
      user: req.user,
      kelass,
      check_user,
      pertanyaan_kelas,
      alur_kelas,
      mentor,
      benefit_kelas,
      teknologi,
      cicilan,
    });
  }

  @Get(':id')
  async detail(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    let isUserInKelas = false;
    if (!req.user) {
      const kelas = await this.kelassService.findOneKelasUser(id);
      const pertanyaan_kelas = await this.kelassService.findPertanyaanKelas(id);
      const alur_kelas = await this.kelassService.findAlurKelas(id);
      const mentor = await this.kelassService.findMentorKelas(id);
      const benefit_kelas = await this.kelassService.findBenefitKelas(id);
      const teknologi = await this.kelassService.findTeknologiKelas(id);
      const cicilan = await this.kelassService.findCicilanKelas(id);
      const user_kelas = await this.kelassService.findUserKelas(id);
      const kelass = await this.kelassService.allClassExcept(kelas.id);
      const daftar = await this.kelassService.sumStudent(kelas.id);
      res.render('kelas/Bdetail', {
        kelas,
        kelass,
        daftar,
        pertanyaan_kelas,
        alur_kelas,
        mentor,
        benefit_kelas,
        teknologi,
        cicilan,
        user_kelas,
      });
    } else {
      const kelas = await this.kelassService.findOneKelasUserLaunch(id);
      for (const u of kelas.user_kelas) {
        if (u.user.id === req.user.id) {
          isUserInKelas = true;
          break;
        }
      }
      if (isUserInKelas) {
        const mingguUpdated = await this.kelassService.findMinggu(
          id,
          req.user.id,
        );
        const user_kelas = await this.kelassService.findOneUserKelas(
          req.user.id,
          kelas.id,
        );
        const portfolio = await this.kelassService.findOnePortfolio(
          req.user.id,
          kelas.id,
        );
        res.render('kelas/detail', {
          user_kelas,
          portfolio,
          user: req.user,
          kelas,
          minggu: mingguUpdated,
        });
      } else {
        const kelas = await this.kelassService.findOneKelasUser(id);
        const pertanyaan_kelas =
          await this.kelassService.findPertanyaanKelas(id);
        const alur_kelas = await this.kelassService.findAlurKelas(id);
        const mentor = await this.kelassService.findMentorKelas(id);
        const benefit_kelas = await this.kelassService.findBenefitKelas(id);
        const teknologi = await this.kelassService.findTeknologiKelas(id);
        const cicilan = await this.kelassService.findCicilanKelas(id);
        const user_kelas = await this.kelassService.findUserKelas(id);
        const kelass = await this.kelassService.allClassExcept(kelas.id);
        const daftar = await this.kelassService.sumStudent(kelas.id);
        res.render('kelas/Bdetail', {
          user: req.user,
          kelas,
          kelass,
          daftar,
          pertanyaan_kelas,
          alur_kelas,
          mentor,
          benefit_kelas,
          teknologi,
          user_kelas,
          cicilan,
        });
      }
    }
  }

  @Roles('admin', 'super_admin')
  @Patch(':kelasId')
  @UseInterceptors(
    FileInterceptor('gambar', multerConfigMemoryOnly),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 1900,
    maxWidth: 1920,
    minHeight: 1000,
    maxHeight: 1080,
    folder: 'program',
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
  })
  async update(
    @UploadedFile() gambar: Express.Multer.File,
    @Param('kelasId') kelasId: number,
    @Body() updateKelassDto: UpdateKelassDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const kelas = await this.kelassService.findOne(kelasId);
      if (gambar) {
        await this.kelassService.deleteFile(kelas.gambar);
        updateKelassDto.gambar = req.body.uploadedImageUrls?.[0];
      }

      if (updateKelassDto.mentoringId) {
        const currentMentoringUserId = kelas.mentoring?.[0]?.user?.id;
        const newMentoringUserId = Number(updateKelassDto.mentoringId);

        if (currentMentoringUserId !== newMentoringUserId) {
          await this.kelassService.updateMentoring(
            newMentoringUserId,
            kelas.id,
          );
        }
      }

      if (updateKelassDto.paid_check === 'true') {
        updateKelassDto.check_paid = true;
      } else if (updateKelassDto.paid_check === 'false') {
        updateKelassDto.check_paid = false;
      }

      if (req.user?.role === 'super_admin') {
        updateKelassDto.proses = 'acc';
      }

      await this.kelassService.update(kelasId, updateKelassDto);
      req.flash('success', 'Successfully update program');

      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);
    } catch (error) {
      req.flash('error', error.message || 'failed update program');
      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);
    }
  }

  @Roles('admin', 'super_admin')
  @Patch(':kelasId/toggle-launch')
  async updateLaunch(
    @Param('kelasId') kelasId: number,
    @Body() updateKelassDto: UpdateKelassDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.kelassService.updateLaunch(kelasId, updateKelassDto);
      req.flash('success', 'program successfuly switch launch');
      res.redirect('/kelass');
    } catch (error) {
      req.flash('error', error.message || 'program failed to launch');
      res.redirect('/kelass');
    }
  }

  @Roles('admin', 'super_admin')
  @Patch(':kelasId/toggle-status')
  async updateStatus(
    @Param('kelasId') kelasId: number,
    @Body() updateKelassDto: UpdateKelassDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.kelassService.updateLaunch(kelasId, updateKelassDto);
      req.flash('success', 'program successfuly switch status');
      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);
    } catch (error) {
      req.flash('error', error.message || 'program failed to switch status');
      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);
    }
  }

  @Roles('admin', 'super_admin')
  @Delete(':kelasId')
  async remove(
    @Param('kelasId') kelasId: number,
    @Body('previous') previous: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const kelas = await this.kelassService.findOne(kelasId);
      if (!kelas) {
        req.flash('error', 'Program not found');
        return res.redirect(previous || '/kelass');
      }
      await this.kelassService.deleteFile(kelas.gambar);
      await this.kelassService.remove(kelasId);
      req.flash('success', 'Program successfully removed');
      return res.redirect(previous || '/kelass');
    } catch (error) {
      req.flash('error', error.message || 'Failed to remove program');
      return res.redirect(previous || '/kelass');
    }
  }

  @Roles('admin', 'super_admin')
  @Delete(':userId/kelas/:kelasId')
  async removeUserKelas(
    @Param('userId') userId: number,
    @Param('kelasId') kelasId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.kelassService.removeUserKelas(userId, kelasId);
      req.flash('success', 'User successfully removed from program');
      res.redirect(`/kelass/addUser/${kelasId}`);
    } catch (error) {
      req.flash('error', error.message || 'Failed to remove user from program');
      res.redirect(`/kelass/addUser/${kelasId}`);
    }
  }

  @Roles('user')
  @Get('pertemuan/:mingguId')
  async getPertemuan(
    @Res() res: Response,
    @Req() req: Request,
    @Param('mingguId') mingguId: number,
  ) {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const pertemuan = await this.kelassService.findPertemuan(mingguId, user.id);
    res.json(pertemuan);
  }

  @Roles('user')
  @Get('quiz/:mingguId')
  async getQuiz(
    @Res() res: Response,
    @Param('mingguId') mingguId: number,
    @Req() req: Request,
  ) {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const quiz = await this.kelassService.findQuiz(mingguId, user.id);
    res.json(quiz);
  }
}
