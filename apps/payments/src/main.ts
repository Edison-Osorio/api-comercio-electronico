import { NestFactory } from '@nestjs/core';
import { PaymentsModule } from './payments.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const tcpConfig: MicroserviceOptions = {
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: 4000, // CRÍTICO: Debe coincidir con el puerto del cliente en User Management
    },
  };

  // Importante: Usar createMicroservice para que escuche mensajes TCP
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    PaymentsModule,
    tcpConfig,
  );

  await app.listen();
}
bootstrap();
