import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Brevo from '@getbrevo/brevo';

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private apiInstance: Brevo.TransactionalEmailsApi;

  constructor(private configService: ConfigService) {
    this.apiInstance = new Brevo.TransactionalEmailsApi();
  }

  onModuleInit() {
    const apiKey = this.configService.get<string>('BREVO_API_KEY');
    this.apiInstance.setApiKey(
      Brevo.TransactionalEmailsApiApiKeys.apiKey,
      apiKey,
    );
  }

  async sendOtp(email: string, code: string, type: string): Promise<void> {
    const sendSmtpEmail = new Brevo.SendSmtpEmail();

    sendSmtpEmail.subject = `Elite Drive – OTP Code (${type})`;
    sendSmtpEmail.to = [{ email: email }];
    sendSmtpEmail.sender = {
      name: this.configService.get('EMAIL_FROM_NAME'),
      email: this.configService.get('EMAIL_FROM'),
    };

    // Sử dụng Template HTML của bạn
    sendSmtpEmail.htmlContent = `
      <div style="font-family: Arial; background:#f5f6fa; padding:24px">
        <div style="max-width:520px; margin:auto; background:#ffffff; padding:32px; border-radius:8px">
          <h2 style="text-align:center">Elite Drive Verification</h2>
          <div style="text-align:center; font-size:28px; font-weight:bold; letter-spacing:4px; padding:20px; background:#f1f5f9">
            ${code}
          </div>
          <p>Use this code to <strong>${type}</strong>. Valid for 5 minutes.</p>
        </div>
      </div>
    `;

    try {
      const { body } = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      this.logger.log(
        `OTP gửi thành công đến ${email} | MessageId: ${body.messageId}`,
      );
    } catch (error: any) {
      // Xử lý lỗi Property 'response' ở đây
      const errorMessage = error.response?.body?.message || error.message;
      this.logger.error(`Lỗi gửi OTP đến ${email}: ${errorMessage}`);
      throw error;
    }
  }
}
