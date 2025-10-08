import { NestFactory } from '@nestjs/core';
import { UserManagementModule } from './user-management.module';
const Eureka = require('eureka-js-client').Eureka;

async function bootstrap() {
  const app = await NestFactory.create(UserManagementModule);

  app.setGlobalPrefix('api/v1');
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
