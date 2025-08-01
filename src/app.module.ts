import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AbsensModule } from './absens/absens.module';
import { MaterisModule } from './materis/materis.module';
import { KelassModule } from './kelass/kelass.module';
import { PertemuansModule } from './pertemuans/pertemuans.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { dataSourceOptions } from './data-source';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      // load: [jwtConfig], 
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    UsersModule, AbsensModule, MaterisModule, KelassModule, PertemuansModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
