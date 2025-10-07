import { Module } from '@nestjs/common';
import { UserManagementController } from './user-management.controller';
import { UserManagementService } from './user-management.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PedidosModule } from './pedidos/pedidos.module';

const PAYMENT_SERVICE = 'USER-MANAGEMENT';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: PAYMENT_SERVICE,
        transport: Transport.TCP,
        options: {
          port: 4000,
        },
      },
    ]),
    PedidosModule,
  ],
  controllers: [UserManagementController],
  providers: [
    {
      provide: UserManagementService,
      useFactory: (client) => new UserManagementService(client),
      inject: [PAYMENT_SERVICE], // Inyectar el cliente TCP
    },
  ],
})
export class UserManagementModule {}
