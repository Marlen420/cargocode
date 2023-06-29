import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import * as ip from 'ip';
config();
const PORT = process.env.PORT || 3000;
const address = ip.address('public', 'ipv4');
async function bootstrap(): Promise<void> {
  const app: INestApplication = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  const config = new DocumentBuilder()
    .setTitle('Title')
    .setDescription('Description')
    .setVersion('')
    .build();
  const document: OpenAPIObject = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('', app, document);
  await app.listen(PORT, () => {
    Logger.log(`Server started on PORT: http://${address}:${PORT}`);
  });
}
bootstrap();
