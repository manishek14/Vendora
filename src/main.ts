import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads/' });
  app.enableCors();

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Online Shop API')
    .setDescription('مستندات API فروشگاه آنلاین')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'احراز هویت')
    .addTag('products', 'محصولات')
    .addTag('reviews', 'نظرات و امتیازدهی')
    .addTag('tickets', 'تیکت پشتیبانی')
    .addTag('orders', 'سفارشات')
    .addTag('cart', 'سبد خرید')
    .addTag('wallet', 'کیف پول')
    .addTag('admin', 'داشبورد ادمین')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application running on: http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`Swagger docs: http://localhost:${process.env.PORT ?? 3000}/api/docs`);
}
bootstrap();
