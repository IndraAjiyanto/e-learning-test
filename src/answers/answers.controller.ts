import { Controller, UseGuards } from '@nestjs/common';
import { AnswersService } from './answers.service';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';

@UseGuards(AuthenticatedGuard)
@Controller('answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}
}
