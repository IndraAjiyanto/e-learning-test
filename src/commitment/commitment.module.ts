import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommitmentService } from './commitment.service';
import { CommitmentController } from './commitment.controller';
import { Commitment } from '../entities/commitment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Commitment])],
  controllers: [CommitmentController],
  providers: [CommitmentService],
  exports: [CommitmentService],
})
export class CommitmentModule {}
