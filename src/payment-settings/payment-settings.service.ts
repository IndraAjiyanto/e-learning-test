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
    } catch (err: any) {
      // ponytail: in-memory fallback saat tabel belum ada (code 42P01) agar endpoint publik tidak crash 500
      if (err?.code === '42P01') {
        return {
          id: 'fallback-default',
          manual_enabled: true,
          gateway_enabled: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as PaymentSettings;
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

    if (patch.manual_enabled === true) {
      settings.manual_enabled = true;
      settings.gateway_enabled = false;
    } else if (patch.gateway_enabled === true) {
      settings.gateway_enabled = true;
      settings.manual_enabled = false;
    } else {
      // Tidak ada kanal yang dinyalakan pada patch ini. Jaga agar minimal
      // satu kanal tetap hidup: kalau patch mematikan kanal yang sedang
      // aktif, kanal itu dinyalakan kembali (Manual yang menang bila
      // keduanya disebut).
      const wantsManual = patch.manual_enabled === false;
      const wantsGateway = patch.gateway_enabled === false;

      if (wantsManual && wantsGateway) {
        settings.manual_enabled = true;
        settings.gateway_enabled = false;
      } else if (wantsGateway && !settings.manual_enabled) {
        // Mematikan gateway tanpa menyalakan manual, sementara manual memang
        // sedang mati -> harus pilih kanal, dan hanya manual yang tidak
        // bergantung pada env.
        settings.manual_enabled = true;
        settings.gateway_enabled = false;
      } else if (wantsManual && !settings.gateway_enabled) {
        // Mematikan manual tanpa menyalakan gateway, sementara gateway memang
        // sedang mati -> sama, jatuh ke manual.
        settings.manual_enabled = true;
        settings.gateway_enabled = false;
      } else {
        Object.assign(settings, patch);
      }
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
    const gatewayAvailable = Boolean(process.env.XENDIT_SECRET_KEY);
    const gatewayHidden = s.gateway_enabled && !gatewayAvailable;

    let manualEnabled = s.manual_enabled;
    let gatewayEnabled = s.gateway_enabled && gatewayAvailable;

    if (manualEnabled && gatewayEnabled) {
      // Dua-duanya nyala di database: pilih satu. Manual tidak butuh
      // konfigurasi eksternal, jadi dipilih lebih dulu.
      gatewayEnabled = false;
    }
    if (!manualEnabled && !gatewayEnabled) {
      manualEnabled = true;
    }

    return {
      manual_enabled: manualEnabled,
      gateway_enabled: gatewayEnabled,
      gateway_hidden_because_key_missing: gatewayHidden,
    };
  }
}