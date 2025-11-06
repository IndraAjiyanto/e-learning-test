import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, Res, Req, UploadedFile } from '@nestjs/common';
import { PendaftaranService } from './pendaftaran.service';
import { CreatePendaftaranDto } from './dto/create-pendaftaran.dto';
import { UpdatePendaftaranDto } from './dto/update-pendaftaran.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfigPayment } from 'src/common/config/multer.config';
import { Request, Response } from 'express';

@UseGuards(AuthenticatedGuard)
@Controller('pendaftaran')
export class PendaftaranController {
  constructor(private readonly pendaftaranService: PendaftaranService) {}

  @Roles('user')
  @Post(':userId/:kelasId')
  @UseInterceptors(FileInterceptor('file', multerConfigPayment))
  async create(@Param('userId') userId: number, @Param('kelasId') kelasId: number, @Body() createPendaftaranDto: CreatePendaftaranDto,   @UploadedFile() file: Express.Multer.File, @Res() res:Response, @Req() req:Request
  ) {
    try {

    createPendaftaranDto.file = file.path
    createPendaftaranDto.kelasId = kelasId
    createPendaftaranDto.userId = userId
    createPendaftaranDto.proses = 'proces'
    const pendaftaran = await this.pendaftaranService.create(createPendaftaranDto);
    if(pendaftaran == false){
        await this.pendaftaranService.getPublicIdFromUrl(createPendaftaranDto.file);
        req.flash('info', 'anda sudah mengirimkan bukti pembayaran, silahkan tunggu info selanjutnya dari admin')
        res.redirect(`/pembayarans/riwayat/${userId}`)
    }else{
        req.flash('success', 'bukti pembayaran berhasil di kirim, silahkan tunggu admin')
        res.redirect(`/pembayarans/riwayat/${userId}`)
    }
    
    } catch (error) {
    console.log(error)
    req.flash('error', 'bukti pembayaran gagal dikirim ')
    res.redirect(`/pembayarans/riwayat/${userId}`)
    }
  }

  @Roles('super_admin')
  @Get()
  async findAll() {
    return await this.pendaftaranService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pendaftaranService.findOne(+id);
  }

  @Roles('super_admin')
  @Patch(':proses/:pendaftaranId')
  async update(@Param('pendaftaranId') pendaftaranId: number, @Param('proses') proses: string, @Body() updatePendaftaranDto: UpdatePendaftaranDto, @Res() res:Response, @Req() req:Request) {
    try {
    const pendaftaran = await this.pendaftaranService.findOne(pendaftaranId)
    if(!pendaftaran){
      return null
    }
    if(proses === 'acc'){
    updatePendaftaranDto.file = pendaftaran['file']
    updatePendaftaranDto.userId = pendaftaran['user']['id']
    updatePendaftaranDto.kelasId = pendaftaran['kelas']['id']
    updatePendaftaranDto.proses = 'acc'
    await this.pendaftaranService.update(pendaftaranId,updatePendaftaranDto)
    await this.pendaftaranService.addUserToKelas(pendaftaran['user']['id'], pendaftaran['kelas']['id']);
    req.flash('success', 'proces successfully change acc')
    res.redirect('/pembayarans')
    } else if (proses === 'rejected'){
      updatePendaftaranDto.file = pendaftaran['file']
      updatePendaftaranDto.userId = pendaftaran['user']['id']
      updatePendaftaranDto.kelasId = pendaftaran['kelas']['id']
      updatePendaftaranDto.proses = 'rejected'
      await this.pendaftaranService.update(pendaftaranId,updatePendaftaranDto)
      req.flash('success', 'proces successfully change rejected')
      res.redirect('/pembayarans')
    }
    } catch (error) {
      console.log(error)
        req.flash('error', 'proses pembayaran gagal diubah')
        res.redirect('/pembayarans')
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pendaftaranService.remove(+id);
  }
}
