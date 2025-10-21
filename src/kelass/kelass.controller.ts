import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { KelassService } from './kelass.service';
import { CreateKelassDto } from './dto/create-kelass.dto';
import { UpdateKelassDto } from './dto/update-kelass.dto';
import { Request, Response } from 'express';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  multerConfigImage,
  multerConfigMemory,
} from 'src/common/config/multer.config';
import { UsersService } from 'src/users/users.service';
import { ValidateImageInterceptor } from 'src/common/interceptors/validate-image.interceptor';
import { ValidateImage } from 'src/common/decorators/validate-image.decorator';

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
    minWidth: 1000,
    maxWidth: 1080,
    minHeight: 1200,
    maxHeight: 1350,
    folder: 'nestjs/images/banner/class',
  })
  async create(
    @Body() createKelassDto: CreateKelassDto,
    @Res() res: Response,
    @UploadedFile() gambar: Express.Multer.File,
    @Req() req: Request,
  ) {
    try {
      createKelassDto.gambar = req.body.uploadedImageUrls?.[0];
      createKelassDto.proses = 'proces';
      await this.kelassService.create(createKelassDto);
      req.flash('success', 'class successfully created');
      res.redirect('/kelass');
    } catch (error) {
      console.log(error);
      req.flash('error', 'class failed created');
      res.redirect('/kelass');
    }
  }

  @Roles('admin')
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
      res.redirect('/kelass');
    } catch (error) {
      req.flash('error', 'user failed add to class');
      res.redirect('/kelass');
    }
  }

  @Roles('super_admin')
  @Get('/addPrice/:kelasId')
  async addPrice(
    @Param('kelasId') kelasId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    res.render('super_admin/kelas/create', { user: req.user });
  }

  // Get all class
  @Roles('admin', 'super_admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    const kelas = await this.kelassService.allKelas();
    res.render('admin/kelas/index', { user: req.user, kelas });
  }

  // Form create class
  @Roles('admin', 'super_admin')
  @Get('/create')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    const kategori = await this.kelassService.findKategori();
    const jenis_kelas = await this.kelassService.findJenisKelas();
    return res.render('admin/kelas/create', {
      user: req.user,
      kategori,
      jenis_kelas,
    });
  }

  @Roles('admin')
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
    return res.render('admin/kelas/edit', {
      user: req.user,
      kelas,
      kategori,
      jenis_kelas,
    });
  }

  @Roles('admin')
  @Get('/detail/kelas/admin/:kelasId')
  async detailKelas(
    @Param('kelasId') kelasId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const kelas = await this.kelassService.findOne(kelasId);
    const minggu = await this.kelassService.findMingguClass(kelasId);
    const mentor = await this.kelassService.findMentor(kelasId);
    const mingguTerakhir = await this.kelassService.findMingguTerakhir(kelasId);
    res.render('admin/kelas/detail', {
      user: req.user,
      kelas,
      minggu,
      mingguTerakhir,
      mentor,
    });
  }

  @Get(':id')
  async detail(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const kelas = await this.kelassService.findOne(id);
    let isUserInKelas = false;
    if (!kelas) {
      req.flash('info', 'not found class');
    } else if (!req.user) {
          const kelass = await this.kelassService.allClassExcept(kelas.id);
    const daftar = await this.kelassService.sumStudent(kelas.id);
      res.render('kelas/Bdetail', { kelas, kelass, daftar });
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
            const kelass = await this.kelassService.allClassExcept(kelas.id);
    const daftar = await this.kelassService.sumStudent(kelas.id);
        res.render('kelas/Bdetail', { user: req.user, kelas, kelass, daftar });
      }
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

  // update kelas
  @Roles('admin', 'super_admin')
  @Patch(':kelasId')
  @UseInterceptors(FileInterceptor('gambar', multerConfigImage))
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
        await this.usersService.getPublicIdFromUrl(kelas.gambar);
        updateKelassDto.gambar = gambar.path;
      }
      if (req.user?.role === 'super_admin') {
        updateKelassDto.proses = 'acc';
      }
      await this.kelassService.update(kelasId, updateKelassDto);
      req.flash('success', 'Successfully update kelas');
      if (req.user?.role == 'super_admin') {
        res.redirect('/kelass');
      } else {
        res.redirect(`/kelass/detail/kelas/admin/${kelasId}`);
      }
    } catch (error) {
      req.flash('error', 'failed update kelas');
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
      req.flash('error', 'class failed to launch');
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
      req.flash('error', 'Class failed removed');
      res.redirect('/kelass');
    }
  }

  @Roles('admin')
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
      res.redirect('/kelass');
    } catch (error) {
      console.log(error);
      req.flash('error', 'class unsuccess delete');
      res.redirect('/kelass');
    }
  }
}
