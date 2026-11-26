import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import * as nodemailer from 'nodemailer';

export interface EnrollmentNotificationPayload {
  /** Nama lengkap / username peserta */
  studentName: string;
  /** Email peserta */
  studentEmail: string;
  /** Nomor WA peserta (opsional) */
  studentPhone?: string;
  /** Nama program / course */
  courseName: string;
  /** id program */
  courseId: string;
  /** Jenis pendaftaran: 'xendit' | 'manual' | 'registration' */
  paymentType: 'xendit' | 'manual' | 'registration';
  /** Nomor invoice/pembayaran */
  invoiceNo?: string;
  /** Total yang harus dibayar (opsional, 0 untuk gratis) */
  amount?: number;
  /** Waktu daftar */
  registeredAt?: Date;
}

@Injectable()
export class NotificationService {
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.MAIL_PORT || '587'),
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  /**
   * Kirim notifikasi email ke semua user ber-role super_admin ketika ada
   * peserta baru mendaftar ke sebuah program (baik Xendit maupun manual).
   * Error SMTP tidak akan melempar exception — hanya di-log agar alur utama
   * tidak terganggu.
   */
  async notifySuperAdminNewEnrollment(
    payload: EnrollmentNotificationPayload,
  ): Promise<void> {
    try {
      const superAdmins = await this.userRepository.find({
        where: { role: 'super_admin' },
        select: ['id', 'email', 'username'],
      });

      if (!superAdmins.length) {
        console.warn(
          '[NotificationService] Tidak ada super_admin untuk dikirim notifikasi.',
        );
        return;
      }

      const to = superAdmins.map((u) => u.email).join(', ');

      const paymentTypeLabel = {
        xendit: '💳 Xendit (Payment Gateway)',
        manual: '🏦 Transfer Manual',
        registration: '📋 Pendaftaran (Free/Registration)',
      }[payload.paymentType];

      const formattedAmount =
        payload.amount !== undefined && payload.amount > 0
          ? 'Rp ' + Number(payload.amount).toLocaleString('id-ID')
          : payload.amount === 0
            ? 'Gratis'
            : '-';

      const formattedDate = (payload.registeredAt || new Date()).toLocaleString(
        'id-ID',
        {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Jakarta',
        },
      );

      const adminPanelUrl = `${process.env.APP_URL_LMS || 'http://localhost:3000'}`;

      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notifikasi Pendaftar Baru</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f5f5f5;">
  <table role="presentation" style="width:100%;border-collapse:collapse;">
    <tr>
      <td align="center" style="padding:40px 0;">
        <table role="presentation" style="width:600px;border-collapse:collapse;background-color:#ffffff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="padding:40px 40px 20px;text-align:center;background:linear-gradient(135deg,#1e293b 0%,#334155 100%);border-radius:8px 8px 0 0;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;">Kesatria Academy</h1>
              <p style="margin:10px 0 0;color:#e2e8f0;font-size:14px;">🔔 Notifikasi Pendaftar Baru</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 8px;color:#1e293b;font-size:22px;font-weight:600;">
                Ada Peserta Baru Mendaftar!
              </h2>
              <p style="margin:0 0 24px;color:#64748b;font-size:14px;">
                Diterima pada <strong>${formattedDate} WIB</strong>
              </p>

              <!-- Info Table -->
              <table role="presentation" style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;border:1px solid #e2e8f0;">
                <tr style="background-color:#f8fafc;">
                  <td style="padding:14px 20px;color:#64748b;font-size:14px;font-weight:600;width:40%;border-bottom:1px solid #e2e8f0;">Program</td>
                  <td style="padding:14px 20px;color:#1e293b;font-size:14px;font-weight:700;border-bottom:1px solid #e2e8f0;">${payload.courseName}</td>
                </tr>
                <tr>
                  <td style="padding:14px 20px;color:#64748b;font-size:14px;font-weight:600;border-bottom:1px solid #e2e8f0;">Nama Peserta</td>
                  <td style="padding:14px 20px;color:#1e293b;font-size:14px;border-bottom:1px solid #e2e8f0;">${payload.studentName}</td>
                </tr>
                <tr style="background-color:#f8fafc;">
                  <td style="padding:14px 20px;color:#64748b;font-size:14px;font-weight:600;border-bottom:1px solid #e2e8f0;">Email Peserta</td>
                  <td style="padding:14px 20px;border-bottom:1px solid #e2e8f0;">
                    <a href="mailto:${payload.studentEmail}" style="color:#3b82f6;text-decoration:none;font-size:14px;">${payload.studentEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 20px;color:#64748b;font-size:14px;font-weight:600;border-bottom:1px solid #e2e8f0;">No. WhatsApp</td>
                  <td style="padding:14px 20px;color:#1e293b;font-size:14px;border-bottom:1px solid #e2e8f0;">${payload.studentPhone || '-'}</td>
                </tr>
                <tr style="background-color:#f8fafc;">
                  <td style="padding:14px 20px;color:#64748b;font-size:14px;font-weight:600;border-bottom:1px solid #e2e8f0;">Metode Pembayaran</td>
                  <td style="padding:14px 20px;color:#1e293b;font-size:14px;border-bottom:1px solid #e2e8f0;">${paymentTypeLabel}</td>
                </tr>
                <tr>
                  <td style="padding:14px 20px;color:#64748b;font-size:14px;font-weight:600;border-bottom:1px solid #e2e8f0;">No. Invoice</td>
                  <td style="padding:14px 20px;color:#1e293b;font-size:14px;font-family:monospace;border-bottom:1px solid #e2e8f0;">${payload.invoiceNo || '-'}</td>
                </tr>
                <tr style="background-color:#f8fafc;">
                  <td style="padding:14px 20px;color:#64748b;font-size:14px;font-weight:600;">Total Pembayaran</td>
                  <td style="padding:14px 20px;color:#059669;font-size:16px;font-weight:700;">${formattedAmount}</td>
                </tr>
              </table>

              <!-- CTA -->
              <table role="presentation" style="margin:32px 0 0;">
                <tr>
                  <td style="border-radius:8px;background:linear-gradient(135deg,#334155 0%,#1e293b 100%);">
                    <a href="${adminPanelUrl}/program/detail/program/admin/${payload.courseId}"
                       target="_blank"
                       style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;border-radius:8px;">
                      Lihat di Panel Admin →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;color:#94a3b8;font-size:13px;line-height:1.6;">
                Email ini dikirim otomatis oleh sistem Kesatria Academy.<br>
                Mohon tidak membalas email ini.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background-color:#f8fafc;border-radius:0 0 8px 8px;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                © ${new Date().getFullYear()} Kesatria Academy. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

      await this.transporter.sendMail({
        from: `"${process.env.MAIL_FROM_NAME || 'Kesatria Academy'}" <${process.env.MAIL_FROM || process.env.MAIL_USER}>`,
        to,
        subject: `🔔 [Peserta Baru] ${payload.studentName} mendaftar ke "${payload.courseName}"`,
        html,
      });
    } catch (err) {
      // Jangan propagate error agar alur utama tidak gagal
      console.error(
        '[NotificationService] Gagal mengirim notifikasi super_admin:',
        err,
      );
    }
  }
}
