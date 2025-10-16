import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/user.entity';
import { AppModule } from 'src/app.module';
import { Kategori } from 'src/entities/kategori.entity';
import { Kelas } from 'src/entities/kelas.entity';
import { JenisKelas } from 'src/entities/jenis_kelas.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const userRepository = dataSource.getRepository(User);
  const kategoriRepository = dataSource.getRepository(Kategori);
  const kelassRepository = dataSource.getRepository(Kelas);
  const jenisKelasRepository = dataSource.getRepository(JenisKelas);

  const hashedPassword = await bcrypt.hash('12345678', 10);

  await userRepository.save([
    {
      username: 'super admin',
      email: 'super@gmail.com',
      profile: 'logo_wiratek.png',
      password: hashedPassword,
      role: 'super_admin',
    },
    {
      username: 'mentor',
      email: 'mentor@gmail.com',
      profile: 'logo_wiratek.png',
      password: hashedPassword,
      role: 'admin',
    },
    {
      username: 'indra',
      email: 'indra@gmail.com',
      profile: 'logo_wiratek.png',
      password: hashedPassword,
      role: 'user',
    }
  ]);

    await kategoriRepository.save([
    {
      nama_kategori: 'Short Class',
      icon: 'short.png',
      deskripsi: 'class free'
    },
    {
      nama_kategori: 'Course',
            icon: 'course.png',
      deskripsi: 'class advance'
    },
    {
      nama_kategori: 'Bootcamp',
      icon: 'bootcamp.png',
      deskripsi: 'class intermediet'
    }
  ]);

  await jenisKelasRepository.save([
    {
      nama_jenis_kelas: 'Web Development',
            icon: 'web_development.png',
      deskripsi: 'development'
    }
  ])

await kelassRepository.save([
  {
    nama_kelas: 'Full Stack Developer',
    deskripsi: 'belajar menjadi full stack developer',
    gambar: 'logo.png',
    kuota: 10 ,
    harga: 1000000,
    promo: 5000000,
    lokasi: 'kantor wiratek',
    metode: 'offline',
    proses: 'acc',
    kriteria: ['paham javascript', 'paham konsep dasar dasar pemrograman'],
    launch: false,
    teknologi: ['nest js', 'react js'],
    materi: ['javascript', 'css'],
    target_pembelajaran: ['paham alur nest js', 'mahir di bidang full stack developer'],
    jenis_kelas: {id:  1},
    kategori: {id: 1}
  },
])


  await app.close();
}
bootstrap();