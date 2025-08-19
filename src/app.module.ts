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
import { dataSourceOptions } from './data-source';
import { AuthModule } from './auth/auth.module';
// import { ServeStaticModule } from '@nestjs/serve-static';
// import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..','src', 'common','public'),
    // }),
    UsersModule, AbsensModule, MaterisModule, KelassModule, PertemuansModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
