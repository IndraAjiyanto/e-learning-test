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
import { BiodatasModule } from './biodatas/biodatas.module';
import { PortfoliosModule } from './portfolios/portfolios.module';
import { KategorisModule } from './kategoris/kategoris.module';
import { JawabansModule } from './jawabans/jawabans.module';
import { TugassModule } from './tugass/tugass.module';
import { PembayaransModule } from './pembayarans/pembayarans.module';
import { PertanyaansModule } from './pertanyaans/pertanyaans.module';
import { JawabanTugassModule } from './jawaban_tugass/jawaban_tugass.module';
import { JawabanUsersModule } from './jawaban_users/jawaban_users.module';
import { KomentarModule } from './komentar/komentar.module';
import { LogbookModule } from './logbook/logbook.module';
import { MingguModule } from './minggu/minggu.module';
import { QuizModule } from './quiz/quiz.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PertanyaanUmumModule } from './pertanyaan_umum/pertanyaan_umum.module';
import { AlumniModule } from './alumni/alumni.module';
import { JenisKelasModule } from './jenis_kelas/jenis_kelas.module';
import { SertifikatModule } from './sertifikat/sertifikat.module';
import { KerjaSamaModule } from './kerja_sama/kerja_sama.module';
import { PertanyaanKelasModule } from './pertanyaan_kelas/pertanyaan_kelas.module';
import { LogbookMentorModule } from './logbook_mentor/logbook_mentor.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..','src', 'common','public'),
    // }),
    UsersModule, AbsensModule, MaterisModule, KelassModule, PertemuansModule, AuthModule, BiodatasModule, PortfoliosModule, KategorisModule, JawabansModule, TugassModule, PembayaransModule, PertanyaansModule, JawabanTugassModule, JawabanUsersModule, KomentarModule, LogbookModule, MingguModule, QuizModule, DashboardModule, PertanyaanUmumModule, AlumniModule, JenisKelasModule, SertifikatModule, KerjaSamaModule, PertanyaanKelasModule, LogbookMentorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
