import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import compression from 'compression';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
    cors: true,
  });

  app.setGlobalPrefix('api/v1');

  // ValidationPipe global: activa los decoradores class-validator de los DTOs
  // (sin esto eran código muerto). whitelist elimina campos no declarados
  // (evita mass-assignment vía Object.assign), forbidNonWhitelisted rechaza
  // cuerpos con campos extra, y transform aplica coerción de tipos.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.use(compression());

  const config = new DocumentBuilder()
    .setTitle('Pistis API')
    .setDescription(
      'Backend de Pistis para gestion de clientes, transacciones, autenticacion y pagos (Mercado Pago)',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Prizma canonical health endpoint (matches prizma-contracts SERVICES.pistis.healthPath).
  // Served at the root path (no /api/v1 prefix) so Nous / the Portal can probe it.
  app
    .getHttpAdapter()
    .getInstance()
    .get('/health', (req, res) => {
      res.status(200).json({ status: 'healthy', service: 'pistis' });
    });

  const configService = app.get(ConfigService);
  const port = configService.get('PORT', 8080);
  await app.listen(port, '0.0.0.0', () => {
    console.info(`Application is running on port ${port}`);
  });
}
bootstrap();
