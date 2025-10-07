import { NestFactory } from '@nestjs/core';
import { PaymentsModule } from './payments.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const tcpConfig: MicroserviceOptions = {
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: 4000,
    },
  };

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    PaymentsModule,
    tcpConfig,
  );

  await app.listen();
}
bootstrap();
