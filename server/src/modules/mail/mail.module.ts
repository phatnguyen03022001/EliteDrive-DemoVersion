import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get('SMTP_HOST'),
          port: +config.get('SMTP_PORT'), // 587
          secure: false, // false cho port 587
          auth: {
            user: config.get('SMTP_USER'),
            pass: config.get('SMTP_PASS'),
          },
          // --- BẮT BUỘC THÊM ĐOẠN NÀY ĐỂ CHẠY TRÊN RENDER ---
          tls: {
            rejectUnauthorized: false, // Tránh lỗi từ chối chứng chỉ khi chạy trong Docker/Cloud
          },
          connectionTimeout: 10000, // Tăng thời gian chờ lên 10s
          greetingTimeout: 10000,
          // -----------------------------------------------
        },
        defaults: {
          from: config.get('EMAIL_FROM'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
