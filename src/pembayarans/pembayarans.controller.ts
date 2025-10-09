import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Res, Req } from '@nestjs/common';
import { PembayaransService } from './pembayarans.service';
import { CreatePembayaranDto } from './dto/create-pembayaran.dto';
import { UpdatePembayaranDto } from './dto/update-pembayaran.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfigPayment } from 'src/common/config/multer.config';
import { Request, Response } from 'express';

@UseGuards(AuthenticatedGuard)
@Controller('pembayarans')
export class PembayaransController {
  constructor(private readonly pembayaransService: PembayaransService) {}

  @Roles('user')
  @Post(':userId/:kelasId')
  @UseInterceptors(FileInterceptor('file', multerConfigPayment))
  async create(@Param('userId') userId: number, @Param('kelasId') kelasId: number, @Body() createPembayaranDto: CreatePembayaranDto,   @UploadedFile() file: Express.Multer.File, @Res() res:Response, @Req() req:Request
  ) {
    try {
    const kelas = await this.pembayaransService.findKelas(kelasId)
    if(kelas?.kategori.nama_kategori == "Short Class"){
      try {
            createPembayaranDto.kelasId = kelasId
            createPembayaranDto.userId = userId
            createPembayaranDto.proses = 'acc'
            const pembayaran = await this.pembayaransService.create(createPembayaranDto);
            if(pembayaran == false){
              req.flash('info', 'anda sudah terdaftar di kelas')
              res.redirect(`/pembayarans/riwayat/${userId}`)
            }else{
              await this.pembayaransService.addUserToKelas(userId, kelasId);
              req.flash('success', 'anda telah terdaftar kelas')
              res.redirect(`/pembayarans/riwayat/${userId}`)
            }
      } catch (error) {
        console.log(error)
        req.flash('error', 'anda gagal terdaftar kelas')
        res.redirect(`/pembayarans/riwayat/${userId}`)
      }

    }else{
    createPembayaranDto.file = file.path
    createPembayaranDto.kelasId = kelasId
    createPembayaranDto.userId = userId
    createPembayaranDto.proses = 'proces'
    const pembayaran = await this.pembayaransService.create(createPembayaranDto);
    if(pembayaran == false){
        await this.pembayaransService.getPublicIdFromUrl(createPembayaranDto.file);
        req.flash('info', 'anda sudah mengirimkan bukti pembayaran, silahkan tunggu info selanjutnya dari admin')
        res.redirect(`/pembayarans/riwayat/${userId}`)
    }else{
        req.flash('success', 'bukti pembayaran berhasil di kirim, silahkan tunggu admin')
        res.redirect(`/pembayarans/riwayat/${userId}`)
    }
    }
    } catch (error) {
    console.log(error)
    req.flash('error', 'bukti pembayaran gagal dikirim ')
    res.redirect(`/pembayarans/riwayat/${userId}`)
    }
  }

  @Roles('user')
  @Get('riwayat/:userId')
  async riwayat(@Param('userId') userId: number, @Res() res:Response, @Req() req:Request){
    const pembayaran = await this.pembayaransService.findPembayaran(userId)
    res.render('user/riwayat', {user: req.user, pembayaran}) 
  }

  @Roles('user')
  @Get('detail/:kelasId')
  async detail(@Param('kelasId') kelasId:number, @Res() res:Response, @Req() req:Request){
    const kelas = await this.pembayaransService.findKelas(kelasId)
    res.render('user/pembayaran', {user: req.user, kelas})
  }

  @Roles('super_admin')
  @Get()
  async findAll(@Res() res:Response, @Req() req:any) {
    const pembayaran = await this.pembayaransService.findAll();
    res.render('super_admin/pembayaran/index', {user: req.user, pembayaran})
  }

  @Roles('super_admin')
  @Get(':pembayaranId')
  async findOne(@Param('pembayaranId') pembayaranId: number, @Res() res:Response, @Req() req:any) {
    const pembayaran = await this.pembayaransService.findOne(pembayaranId)
    res.render('super_admin/pembayaran/detail', {user: req.user, pembayaran})
  }

  @Roles('super_admin')
  @Patch(':proses/:pembayaranId')
  async update(@Param('pembayaranId') pembayaranId: number, @Param('proses') proses: string, @Body() updatePembayaranDto: UpdatePembayaranDto, @Res() res:Response, @Req() req:Request) {
    try {
    const pembayaran = await this.pembayaransService.findOne(pembayaranId)
    if(!pembayaran){
      return null
    }
    if(proses === 'acc'){
    updatePembayaranDto.file = pembayaran['file']
    updatePembayaranDto.userId = pembayaran['user']['id']
    updatePembayaranDto.kelasId = pembayaran['kelas']['id']
    updatePembayaranDto.proses = 'acc'
    await this.pembayaransService.update(pembayaranId,updatePembayaranDto)
    await this.pembayaransService.addUserToKelas(pembayaran['user']['id'], pembayaran['kelas']['id']);
    req.flash('success', 'proces successfully change acc')
    res.redirect('/pembayarans')
    } else if (proses === 'rejected'){
      updatePembayaranDto.file = pembayaran['file']
      updatePembayaranDto.userId = pembayaran['user']['id']
      updatePembayaranDto.kelasId = pembayaran['kelas']['id']
      updatePembayaranDto.proses = 'rejected'
      await this.pembayaransService.update(pembayaranId,updatePembayaranDto)
      req.flash('success', 'proces successfully change rejected')
      res.redirect('/pembayarans')
    }
    } catch (error) {
        req.flash('error', 'proses pembayaran gagal diubah')
        res.redirect('/pembayarans')
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.pembayaransService.remove(+id);
  }
}
