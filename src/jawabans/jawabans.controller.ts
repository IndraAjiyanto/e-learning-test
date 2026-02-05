import {
  Controller,
  UseGuards,
} from '@nestjs/common';
import { JawabansService } from './jawabans.service';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';

@UseGuards(AuthenticatedGuard)
@Controller('jawabans')
export class JawabansController {
  constructor(private readonly jawabansService: JawabansService) {}

 
}
