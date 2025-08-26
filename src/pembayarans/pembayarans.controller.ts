import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PembayaransService } from './pembayarans.service';
import { CreatePembayaranDto } from './dto/create-pembayaran.dto';
import { UpdatePembayaranDto } from './dto/update-pembayaran.dto';

@Controller('pembayarans')
export class PembayaransController {
  constructor(private readonly pembayaransService: PembayaransService) {}

  @Post()
  create(@Body() createPembayaranDto: CreatePembayaranDto) {
    return this.pembayaransService.create(createPembayaranDto);
  }

  @Get()
  findAll() {
    return this.pembayaransService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pembayaransService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePembayaranDto: UpdatePembayaranDto) {
    return this.pembayaransService.update(+id, updatePembayaranDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pembayaransService.remove(+id);
  }
}
