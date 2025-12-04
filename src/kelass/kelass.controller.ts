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
} from '@nestjs/common';
import { KelassService } from './kelass.service';
import { CreateKelassDto } from './dto/create-kelass.dto';
import { UpdateKelassDto } from './dto/update-kelass.dto';
import { Request, Response } from 'express';
import { Roles } from 'src/common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfigMemory } from 'src/common/config/multer.config';
import { UsersService } from 'src/users/users.service';
import { ValidateImageInterceptor } from 'src/common/interceptors/validate-image.interceptor';
import { ValidateImage } from 'src/common/decorators/validate-image.decorator';
import { FileUploadExceptionFilter } from 'src/common/filters/file-upload-exception.filter';
import { MulterErrorInterceptor } from 'src/common/interceptors/multer-error.interceptor';

@UseFilters(FileUploadExceptionFilter)
@UseInterceptors(MulterErrorInterceptor)
@Controller('kelass')
export class KelassController {
  constructor(
    private readonly kelassService: KelassService,
    private readonly usersService: UsersService,
  ) {}

  // create class
  @Roles('admin', 'super_admin')
  @Post()
  @UseInterceptors(
    FileInterceptor('gambar', multerConfigMemory),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 1900,
    maxWidth: 1920,
    minHeight: 1000,
    maxHeight: 1080,
    folder: 'nestjs/images/banner/class',
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

      if(createKelassDto.bulan){
        createKelassDto.hari = 0
      }

      if(createKelassDto.hari){
        createKelassDto.bulan = 0
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
      req.flash('success', 'class successfully created');
      res.redirect('/kelass');
    } catch (error) {
      req.flash('error', error.message || 'class failed created');
      res.redirect('/kelass');
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
      req.flash('success', 'user successfuly add to class');
      res.redirect(`/kelass/addUser/${kelasId}`);
    } catch (error) {
      req.flash('error', error.message || 'user failed add to class');
      res.redirect(`/kelass/addUser/${kelasId}`);
    }
  }

  // Get all class
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

  // Form create class
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

  // formEdit
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
  @Get('/detail/kelas/admin/:kelasId')
  async detailKelas(
    @Param('kelasId') kelasId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const logbookMentor = await this.kelassService.findLogbookMentor(kelasId);
    const logbookUser = await this.kelassService.findLogBookUser(kelasId);
    const mentor = await this.kelassService.findMentorKelas(kelasId);
    if(req.user!.role === 'admin'){
    const kelas = await this.kelassService.findOneKelasAdmin(kelasId);
    const minggu = await this.kelassService.findMingguKelas(kelasId);
    const mingguTerakhir = await this.kelassService.findMingguTerakhir(kelasId);
    const user_kelas = await this.kelassService.findUserKelas(kelasId);
    res.render('admin/kelas/detail', {
      minggu,
      user_kelas,
      user: req.user,
      kelas,
      mentor,
      mingguTerakhir,
      logbookMentor,
      logbookUser
  });
  }  else if(req.user!.role === 'super_admin'){
    const kelas = await this.kelassService.findOne(kelasId);
    const cicilan = await this.kelassService.findCicilanKelas(kelasId);
    const pendaftaran = await this.kelassService.findPendaftaranKelas(kelasId);
    const benefit_kelas = await this.kelassService.findBenefitKelas(kelasId);
    const pertanyaan_kelas = await this.kelassService.findPertanyaanKelas(kelasId);
    const alur_kelas = await this.kelassService.findAlurKelas(kelasId);
    const pembayaran = await this.kelassService.findPembayaranKelas(kelasId);
    const alumni = await this.kelassService.findAlumniKelas(kelasId);
    const user_kelas = await this.kelassService.findUserKelas(kelasId);
        res.render('admin/kelas/detail', {
      user: req.user,
      pendaftaran,
      pembayaran,
      cicilan,
      kelas,
      mentor,
      benefit_kelas,
      pertanyaan_kelas,
      alur_kelas,
      logbookMentor,
      logbookUser,
      alumni,
      user_kelas
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
    res.render('user/mycourse', { kelas, user: req.user });
  }

  @Roles('user')
  @Get('detail/:kelasId')
  async viewDetail(
    @Param('kelasId') kelasId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const kelas = await this.kelassService.findOneKelasUser(kelasId);
    const check_user = await this.kelassService.checkUserInKelas(
      kelas.id,
      req.user!.id,
    );
    const kelass = await this.kelassService.allClassExcept(kelas.id);
    const pertanyaan_kelas = await this.kelassService.findPertanyaanKelas(kelasId);
      const alur_kelas = await this.kelassService.findAlurKelas(kelasId);
      const mentor = await this.kelassService.findMentorKelas(kelasId);
      const benefit_kelas = await this.kelassService.findBenefitKelas(kelasId);
      const teknologi = await this.kelassService.findTeknologiKelas(kelasId);
      const cicilan = await this.kelassService.findCicilanKelas(kelasId);
    res.render('kelas/Bdetail', { kelas, user: req.user, kelass, check_user, pertanyaan_kelas, alur_kelas, mentor, benefit_kelas, teknologi, cicilan });
  }

  @Get(':id')
  async detail(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const kelas = await this.kelassService.findOneKelasUser(id);
    let isUserInKelas = false;
    if (!kelas) {
      req.flash('info', 'not found class');
    } else if (!req.user) {
      const pertanyaan_kelas = await this.kelassService.findPertanyaanKelas(id);
      const alur_kelas = await this.kelassService.findAlurKelas(id);
      const mentor = await this.kelassService.findMentorKelas(id);
      const benefit_kelas = await this.kelassService.findBenefitKelas(id);
      const teknologi = await this.kelassService.findTeknologiKelas(id);
      const cicilan = await this.kelassService.findCicilanKelas(id);
            const user_kelas = await this.kelassService.findUserKelas(id);
      const kelass = await this.kelassService.allClassExcept(kelas.id);
      const daftar = await this.kelassService.sumStudent(kelas.id);
      res.render('kelas/Bdetail', { kelas, kelass, daftar, pertanyaan_kelas, alur_kelas, mentor, benefit_kelas, teknologi, cicilan, user_kelas});
    } else {
      for (const u of kelas.user_kelas) {
        if (u.user.id === req.user.id) {
          isUserInKelas = true;
          break;
        }
      }
      if (isUserInKelas) {
        const minggu = await this.kelassService.findMinggu(id, req.user.id);
        await Promise.all([
          this.kelassService.createProgresMinggu(req.user.id, minggu),
          this.kelassService.createProgresPertemuan(req.user.id, minggu),
        ]);
        const mingguUpdated = await this.kelassService.findMinggu(
          id,
          req.user.id,
        );

        res.render('kelas/detail', {
          user: req.user,
          kelas,
          minggu: mingguUpdated,
        });
      } else {
        const pertanyaan_kelas = await this.kelassService.findPertanyaanKelas(id);
      const alur_kelas = await this.kelassService.findAlurKelas(id);
      const mentor = await this.kelassService.findMentorKelas(id);
      const benefit_kelas = await this.kelassService.findBenefitKelas(id);
      const teknologi = await this.kelassService.findTeknologiKelas(id);
            const cicilan = await this.kelassService.findCicilanKelas(id);
      const user_kelas = await this.kelassService.findUserKelas(id);
        const kelass = await this.kelassService.allClassExcept(kelas.id);
        const daftar = await this.kelassService.sumStudent(kelas.id);
        res.render('kelas/Bdetail', { user: req.user, kelas, kelass, daftar, pertanyaan_kelas, alur_kelas, mentor, benefit_kelas, teknologi, user_kelas, cicilan });
      }
    }
  }

  // update kelas
  @Roles('admin', 'super_admin')
  @Patch(':kelasId')
  @UseInterceptors(
    FileInterceptor('gambar', multerConfigMemory),
    ValidateImageInterceptor,
  )
  @ValidateImage({
    minWidth: 1900,
    maxWidth: 1920,
    minHeight: 1000,
    maxHeight: 1080,
    folder: 'nestjs/images/banner/class',
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
        // delete previous image in cloud (if exists)
        await this.usersService.getPublicIdFromUrl(kelas.gambar);
        // use uploadedImageUrls provided by validator/uploader (memory upload -> cloud)
        updateKelassDto.gambar = req.body.uploadedImageUrls?.[0];
      }

      if (updateKelassDto.mentoringId) {
        // Check if mentoring exists and if we need to update it
        const currentMentoringUserId = kelas.mentoring?.[0]?.user?.id;
        const newMentoringUserId = Number(updateKelassDto.mentoringId);

        if (currentMentoringUserId !== newMentoringUserId) {
          await this.kelassService.updateMentoring(
            newMentoringUserId,
            kelas.id,
          );
        }
      }

      // Handle paid_check logic
      if (updateKelassDto.paid_check === 'true') {
        updateKelassDto.check_paid = true;
      } else if (updateKelassDto.paid_check === 'false') {
        updateKelassDto.check_paid = false;
      }

      // Super admin always approve
      if (req.user?.role === 'super_admin') {
        updateKelassDto.proses = 'acc';
      }

      await this.kelassService.update(kelasId, updateKelassDto);
      req.flash('success', 'Successfully update kelas');

      res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);
    } catch (error) {
      req.flash('error', error.message || 'failed update kelas');
      res.redirect('/kelass');
    }
  }

  // toogle update
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
      req.flash('success', 'class successfuly switch launch');
      res.redirect('/kelass');
    } catch (error) {
      req.flash('error', error.message || 'class failed to launch');
      res.redirect('/kelass');
    }
  }

  @Roles('admin', 'super_admin')
  @Delete(':kelasId')
  async remove(
    @Param('kelasId') kelasId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const kelas = await this.kelassService.findOne(kelasId);
      if (!kelas) {
        req.flash('error', 'Kelas not found');
        res.redirect('/kelass');
      }
      await this.usersService.getPublicIdFromUrl(kelas.gambar);
      await this.kelassService.remove(kelasId);
      req.flash('success', 'Class successfully removed');
      res.redirect('/kelass');
    } catch (error) {
      req.flash('error', error.message || 'Class failed removed');
      res.redirect('/kelass');
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
      req.flash('success', 'class successfuly delete');
      res.redirect(`/kelass/addUser/${kelasId}`);
    } catch (error) {
      req.flash('error', error.message || 'class unsuccess delete');
      res.redirect(`/kelass/addUser/${kelasId}`);
    }
  }
}
