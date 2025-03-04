import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RequestMethod } from '@nestjs/common';

// Add custom BigInt serialization
// This needs to be done before any other code runs
(BigInt.prototype as any).toJSON = function() {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('v1', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
