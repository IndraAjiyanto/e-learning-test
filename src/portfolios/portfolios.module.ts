import { Module } from '@nestjs/common';
import { PortfoliosService } from './portfolios.service';
import { PortfoliosController } from './portfolios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Portfolio } from 'src/entities/portfolio.entity';
import { User } from 'src/entities/user.entity';
import { Kelas } from 'src/entities/kelas.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Portfolio, User, Kelas])],
  controllers: [PortfoliosController],
  providers: [PortfoliosService],
  exports: [PortfoliosService]
})
export class PortfoliosModule {}
