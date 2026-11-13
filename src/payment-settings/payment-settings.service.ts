import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentSettings } from 'src/entities/payment-settings.entity';

@Injectable()
export class PaymentSettingsService {
  private static manualDisabled = false;

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
        // Default: Gateway bila Xendit terkonfigurasi, manual dinonaktifkan sementara
        const gatewayAvailable = Boolean(process.env.XENDIT_SECRET_KEY);
        settings = await this.settingsRepository.save(
          this.settingsRepository.create({
            manual_enabled: false,
            gateway_enabled: gatewayAvailable,
          }),
        );
      } else if (!PaymentSettingsService.manualDisabled) {
        // Manual payment dinonaktifkan sementara atas permintaan pengguna (jangan dihapus)
        PaymentSettingsService.manualDisabled = true;
        if (settings.manual_enabled || !settings.gateway_enabled) {
          settings.manual_enabled = false;
          settings.gateway_enabled = true;
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
          manual_enabled: false,
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
   * Catatan: Metode pembayaran manual dinonaktifkan sementara (jangan dihapus).
   * Kanal aktif diarahkan ke Gateway (Xendit).
   */
  async update(patch: Partial<PaymentSettings>): Promise<PaymentSettings> {
    const settings = await this.get();

    // Manual payment dinonaktifkan sementara — selalu paksa gateway aktif dan manual nonaktif
    settings.manual_enabled = false;
    settings.gateway_enabled = true;

    return this.settingsRepository.save(settings);
  }

  /**
   * Status kanal yang dipakai UI & guard.
   *
   * Metode pembayaran manual dinonaktifkan sementara (jangan dihapus tapi dinonaktifkan).
   * Hanya gateway yang aktif jika kunci Xendit terkonfigurasi.
   */
  async effective() {
    const s = await this.get();
    const gatewayAvailable = Boolean(process.env.XENDIT_SECRET_KEY);
    const gatewayHidden = !gatewayAvailable;

    // Manual payment dinonaktifkan sementara (jangan dihapus)
    const manualEnabled = false;
    const gatewayEnabled = gatewayAvailable;

    return {
      manual_enabled: manualEnabled,
      gateway_enabled: gatewayEnabled,
      gateway_hidden_because_key_missing: gatewayHidden,
    };
  }
}
