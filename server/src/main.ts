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

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, Accept',
  });

  const port = 8000;
  await app.listen(port);

  logger.log(`🚀 App started on port ${port}`);
}

bootstrap();
