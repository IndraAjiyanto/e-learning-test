import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
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

  async sendVerificationEmail(to: string, verificationToken: string, username: string) {
    const verificationUrl = `${process.env.APP_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}&email=${to}`;
    const mailOptions = {
      from: `"${process.env.MAIL_FROM_NAME || 'Kesatria Academy'}" <${process.env.MAIL_FROM || process.env.MAIL_USER}>`,
      to,
      subject: 'Email Verification - Kesatria Academy',
      html: `
        <p>Hi <strong>${username}</strong>,</p>
        <p>Thank you for registering at Kesatria Academy. Please verify your email address by clicking the link below:</p>
        <p><a href="${verificationUrl}">Verify Email</a></p>
        <p>If you did not create an account, no further action is required.</p>
        <p>Best regards,<br/>Kesatria Academy Team</p>
      `,
    };
    await this.transporter.sendMail(mailOptions);
  }

  async sendPasswordResetEmail(
    to: string,
    resetToken: string,
    username: string,
  ) {
    const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${to}`;

    const mailOptions = {
      from: `"${process.env.MAIL_FROM_NAME || 'Kesatria Academy'}" <${process.env.MAIL_FROM || process.env.MAIL_USER}>`,
      to,
      subject: 'Password Reset Request - Kesatria Academy',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border-radius: 8px 8px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Kesatria Academy</h1>
                      <p style="margin: 10px 0 0; color: #e2e8f0; font-size: 14px;">Student Service Center</p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 20px; color: #1e293b; font-size: 24px; font-weight: 600;">Password Reset Request</h2>
                      
                      <p style="margin: 0 0 16px; color: #475569; font-size: 16px; line-height: 1.6;">
                        Hi <strong>${username}</strong>,
                      </p>
                      
                      <p style="margin: 0 0 16px; color: #475569; font-size: 16px; line-height: 1.6;">
                        We received a request to reset your password. Click the button below to create a new password:
                      </p>

                      <!-- Button -->
                      <table role="presentation" style="margin: 30px 0;">
                        <tr>
                          <td style="border-radius: 8px; background: linear-gradient(135deg, #334155 0%, #1e293b 100%);">
                            <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 0 0 16px; color: #475569; font-size: 14px; line-height: 1.6;">
                        Or copy and paste this link into your browser:
                      </p>
                      
                      <p style="margin: 0 0 24px; padding: 12px; background-color: #f1f5f9; border-radius: 6px; word-break: break-all;">
                        <a href="${resetUrl}" style="color: #3b82f6; text-decoration: none; font-size: 14px;">${resetUrl}</a>
                      </p>

                      <div style="padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px; margin: 24px 0;">
                        <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                          <strong>⚠️ Important:</strong> This link will expire in <strong>2 minutes</strong>. If you didn't request this password reset, please ignore this email or contact support if you have concerns.
                        </p>
                      </div>

                      <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                        Best regards,<br>
                        <strong>Kesatria Academy Team</strong>
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #f8fafc; border-radius: 0 0 8px 8px; text-align: center;">
                      <p style="margin: 0 0 8px; color: #94a3b8; font-size: 12px;">
                        © ${new Date().getFullYear()} Kesatria Academy. All rights reserved.
                      </p>
                      <p style="margin: 0; color: #cbd5e1; font-size: 12px;">
                        Student Service Center - Your Learning Partner
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      throw error;
    }
  }
}