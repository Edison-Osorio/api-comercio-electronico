import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';

export const PAYMENT_SERVICE = 'USER-MANAGEMENT';

interface CreateUserDto {
  email: string;
  firstName: string;
}

@Injectable()
export class UserManagementService {
  private readonly logger = new Logger(UserManagementService.name);

  constructor(@Inject(PAYMENT_SERVICE) private readonly client: ClientProxy) {}

  async createUser(data: CreateUserDto) {
    const userId = uuidv4();
    this.logger.log(`[Users SVC] Usuario ${userId} creado en la DB.`);

    const traceId = uuidv4();

    const eventPayload = {
      id: userId,
      email: data.email,
      firstName: data.firstName,
      traceId: traceId,
    };

    this.logger.log(
      `[Users SVC] Publicando evento 'user.created' con Trace ID: ${traceId}`,
    );

    await this.client.emit({ cmd: 'user.created' }, eventPayload).toPromise();

    this.logger.log(`[Users SVC] Evento enviado al broker (TCP Client).`);

    return {
      userId: userId,
      status:
        'User created and event published (Asynchronous processing started).',
      traceId: traceId,
      paymentServiceResponse: 'Pending (Asynchronous)',
    };
  }
}
