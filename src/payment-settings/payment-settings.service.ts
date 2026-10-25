import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentSettings } from 'src/entities/payment-settings.entity';

@Injectable()
export class PaymentSettingsService {
  constructor(
    @InjectRepository(PaymentSettings)
    private readonly settingsRepository: Repository<PaymentSettings>,
  ) {}

  async get(): Promise<PaymentSettings> {
    try {
      let settings = (
        await this.settingsRepository.find({
          order: { createdAt: 'ASC' },
          take: 1,
        })
      )[0];
      if (!settings) {
        // Default awal: manual. Dua-duanya menyala dulu hanya menyisakan
        // pertanyaan "kenapa user tidak bisa pilih kanal", dan tidak ada satu
        // pun alasan bisnis yang membuat gateway lebih aman sebagai default
        // (gateway butuh XENDIT_SECRET_KEY juga).
        settings = await this.settingsRepository.save(
          this.settingsRepository.create({
            manual_enabled: true,
            gateway_enabled: false,
          }),
        );
      }
      return settings;
    } catch (err: unknown) {
      // ponytail: in-memory fallback saat tabel belum ada (code 42P01) agar endpoint publik tidak crash 500
      if ((err as { code?: string })?.code === '42P01') {
        return {
          id: 'fallback-default',
          manual_enabled: true,
          gateway_enabled: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      throw err;
    }
  }

  /**
   * Menyimpan pengaturan kanal pembayaran.
   *
   * Aturan: HANYA SATU kanal boleh aktif. Menyalakan satu kanal otomatis
   * mematikan yang lain, jadi tidak mungkin ada dua toggle aktif bersamaan.
   * Bila patch menyalakan keduanya sekaligus, `manual` yang menang karena
   * kanal manual tidak bergantung pada konfigurasi pihak ketiga.
   *
   * Patch yang mematikan kanal tanpa menyalakan yang lain (mis. body
   * `{ manual_enabled: false }` saat manual sedang aktif) TIDAK boleh
   * disimpan: kalau diteruskan, program akan tidak punya kanal pembayaran
   * sama sekali dan user tidak bisa mendaftar sama sekali. Kanal yang sedang
   * aktif dipertahankan supaya hasil edit selalu "pindah kanal", bukan
   * "matikan semua".
   */
  async update(patch: Partial<PaymentSettings>): Promise<PaymentSettings> {
    const settings = await this.get();

    // Xendit/Gateway dinonaktifkan untuk sementara - selalu paksa ke manual
    settings.gateway_enabled = false;
    if (patch.manual_enabled === false && patch.gateway_enabled !== true) {
      settings.manual_enabled = true;
    } else if (patch.manual_enabled === true || patch.gateway_enabled !== true) {
      settings.manual_enabled = true;
    }

    return this.settingsRepository.save(settings);
  }

  /**
   * Status kanal yang dipakai UI & guard.
   *
   * Dua aturan berlaku di sini, bukan hanya di `update()`:
   * 1. Hanya satu kanal boleh aktif. State lama yang menyalakan keduanya
   *    (hasil seed migrasi) dinormalkan saat dibaca supaya user tidak pernah
   *    melihat layar "pilih kanal" padahal sistem hanya mengizinkan satu.
   * 2. Gateway otomatis dianggap mati bila kunci Xendit belum dikonfigurasi.
   *    Bila akibatnya tidak ada kanal yang hidup, jatuh ke manual supaya
   *    pembayaran tidak tertutup hanya karena env belum diisi.
   */
  async effective() {
    const s = await this.get();
    // Xendit/Gateway dinonaktifkan untuk sementara
    const gatewayAvailable = false;
    const gatewayHidden = true;

    const manualEnabled = true;
    const gatewayEnabled = false;

    if (!s.manual_enabled || s.gateway_enabled) {
      s.manual_enabled = true;
      s.gateway_enabled = false;
      void this.settingsRepository.save(s).catch(() => undefined);
    }

    return {
      manual_enabled: manualEnabled,
      gateway_enabled: gatewayEnabled,
      gateway_hidden_because_key_missing: gatewayHidden,
    };
  }
}
