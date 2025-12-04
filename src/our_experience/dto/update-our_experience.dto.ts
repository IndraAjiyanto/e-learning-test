import { PartialType } from '@nestjs/mapped-types';
import { CreateOurExperienceDto } from './create-our_experience.dto';

export class UpdateOurExperienceDto extends PartialType(CreateOurExperienceDto) {}
