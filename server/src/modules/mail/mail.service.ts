import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendOtp(email: string, code: string, type: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: `Elite Drive – OTP Code (${type})`,
      html: `
      <div style="font-family: Arial, Helvetica, sans-serif; background:#f5f6fa; padding:24px">
        <div style="max-width:520px; margin:auto; background:#ffffff; border-radius:8px; padding:32px">

          <div style="text-align:center; margin-bottom:24px">
            <div style="
              display:inline-block;
              padding:14px 28px;
              font-size:28px;
              letter-spacing:6px;
              font-weight:700;
              color:#0f172a;
              background:#f1f5f9;
              border-radius:8px;
            ">
              ${code}
            </div>
          </div>

          <h2 style="color:#1e293b; margin-bottom:12px; text-align:center">
            Elite Drive Verification
          </h2>

          <p style="color:#334155; font-size:15px">
            Use the OTP above to <strong>${type}</strong>.
          </p>

          <p style="color:#475569; font-size:14px">
            This code will expire in <strong>5 minutes</strong>.
          </p>

          <p style="color:#64748b; font-size:13px; margin-top:20px">
            If you did not request this, please ignore this email.
          </p>

          <hr style="border:none; border-top:1px solid #e2e8f0; margin:24px 0" />

          <p style="color:#94a3b8; font-size:12px; text-align:center">
            © ${new Date().getFullYear()} Elite Drive. All rights reserved.
          </p>
        </div>
      </div>
    `,
    });
  }
}
