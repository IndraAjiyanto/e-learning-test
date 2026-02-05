import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { JawabansService } from './jawabans.service';
import { CreateJawabanDto } from './dto/create-jawaban.dto';
import { UpdateJawabanDto } from './dto/update-jawaban.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';

@UseGuards(AuthenticatedGuard)
@Controller('jawabans')
export class JawabansController {
  constructor(private readonly jawabansService: JawabansService) {}

 
}
