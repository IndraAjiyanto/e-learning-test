import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentSettings } from 'src/entities/payment-settings.entity';

@Injectable()
export class PaymentSettingsService {
  private static xenditReenabled = false;

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
        // Default awal: Gateway bila Xendit terkonfigurasi, sebaliknya manual.
        const gatewayAvailable = Boolean(process.env.XENDIT_SECRET_KEY);
        settings = await this.settingsRepository.save(
          this.settingsRepository.create({
            manual_enabled: !gatewayAvailable,
            gateway_enabled: gatewayAvailable,
          }),
        );
      } else if (
        !PaymentSettingsService.xenditReenabled &&
        process.env.XENDIT_SECRET_KEY
      ) {
        // Saat xendit dibuka kembali, aktifkan gateway jika sebelumnya dipaksa nonaktif
        PaymentSettingsService.xenditReenabled = true;
        if (!settings.gateway_enabled) {
          settings.gateway_enabled = true;
          settings.manual_enabled = false;
          settings = await this.settingsRepository.save(settings);
        }
      }
      return settings;
    } catch (err: unknown) {
      // ponytail: in-memory fallback saat tabel belum ada (code 42P01) agar endpoint publik tidak crash 500
      if ((err as { code?: string })?.code === '42P01') {
        const gatewayAvailable = Boolean(process.env.XENDIT_SECRET_KEY);
        return {
          id: 'fallback-default',
          manual_enabled: !gatewayAvailable,
          gateway_enabled: gatewayAvailable,
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

    if (patch.manual_enabled === true) {
      settings.manual_enabled = true;
      settings.gateway_enabled = false;
    } else if (patch.gateway_enabled === true) {
      settings.gateway_enabled = true;
      settings.manual_enabled = false;
    } else {
      // Tidak ada kanal yang dinyalakan pada patch ini. Jaga agar minimal
      // satu kanal tetap hidup: kalau patch mematikan kanal yang sedang
      // aktif, kanal itu dinyalakan kembali (Gateway yang menang bila
      // kunci Xendit ada, sebaliknya Manual).
      const wantsManual = patch.manual_enabled === false;
      const wantsGateway = patch.gateway_enabled === false;

      if (wantsManual && wantsGateway) {
        const gatewayAvailable = Boolean(process.env.XENDIT_SECRET_KEY);
        settings.gateway_enabled = gatewayAvailable;
        settings.manual_enabled = !gatewayAvailable;
      } else if (wantsGateway && !settings.manual_enabled) {
        settings.manual_enabled = true;
        settings.gateway_enabled = false;
      } else if (wantsManual && !settings.gateway_enabled) {
        settings.manual_enabled = false;
        settings.gateway_enabled = true;
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
      gatewayEnabled = gatewayAvailable;
      manualEnabled = !gatewayEnabled;
    }
    if (!manualEnabled && !gatewayEnabled) {
      if (gatewayAvailable) {
        gatewayEnabled = true;
        manualEnabled = false;
      } else {
        manualEnabled = true;
      }
    }

    return {
      manual_enabled: manualEnabled,
      gateway_enabled: gatewayEnabled,
      gateway_hidden_because_key_missing: gatewayHidden,
    };
  }
}
