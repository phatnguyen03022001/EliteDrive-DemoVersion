import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppSwaggerConfig } from './config/swagger/swagger.module';
import { PrismaService } from './prisma/prisma.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // --- Đoạn kiểm tra kết nối Mongo ---
  try {
    const prismaService = app.get(PrismaService);
    await prismaService.$connect();
    logger.log('✅ [Database] Status: Connected to Prisma successfully');
  } catch (error) {
    logger.error('❌ [Database] Status: Connection Failed', error);
  }
  // ----------------------------------

  const config = new DocumentBuilder()
    .setTitle('Elite Drive API')
    .setDescription('Elite Drive Backend API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);

  // Optional: swagger json gốc
  app.getHttpAdapter().get('/docs-json', (_req, res) => {
    res.json(document);
  });

  AppSwaggerConfig.setup(app);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  const allowedOrigins = [
    'https://elite-drive-iota.vercel.app', // Đã sửa cho khớp với ảnh bạn gửi
    'http://localhost:3000',
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Logic kiểm tra linh hoạt hơn
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app')
      ) {
        callback(null, true);
      } else {
        callback(new Error('CORS Error: Origin not allowed'));
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, Accept',
  });

  const port = 8000;
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 App started on port ${port}`);
}

bootstrap();
