import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';

// Definición del token de inyección (debe coincidir con el módulo)
export const PAYMENT_SERVICE = 'PAYMENT_SERVICE';

// DTO simulado para la creación de usuarios
interface CreateUserDto {
  email: string;
  firstName: string;
}

@Injectable()
export class UserManagementService {
  private readonly logger = new Logger(UserManagementService.name);

  // Inyectamos el cliente TCP que se conecta al servicio de Pagos
  constructor(@Inject(PAYMENT_SERVICE) private readonly client: ClientProxy) { }

  async createUser(data: CreateUserDto) {
    // 1. Lógica de negocio: Guardar el usuario en la DB (simulado)
    const userId = uuidv4();
    this.logger.log(`[Users SVC] Usuario ${userId} creado en la DB.`);

    // 2. Gobernanza: Generar el Trace ID para observabilidad
    const traceId = uuidv4();

    // 3. Patrón EDA: Publicar el evento de dominio de forma ASÍNCRONA
    const eventPayload = {
      id: userId,
      email: data.email,
      firstName: data.firstName,
      traceId: traceId, // El traceId es crucial para seguir el evento en Pagos
    };

    this.logger.log(`[Users SVC] Publicando evento 'user.created' con Trace ID: ${traceId}`);

    // El método 'emit' envía el mensaje y NO espera respuesta (asíncrono)
    // El 'await' solo espera que el mensaje se ponga en cola de envío.
    await this.client.emit({ cmd: 'user.created' }, eventPayload).toPromise();

    this.logger.log(`[Users SVC] Evento enviado al broker (TCP Client).`);

    return {
      userId: userId,
      status: 'User created and event published (Asynchronous processing started).',
      traceId: traceId,
      paymentServiceResponse: 'Pending (Asynchronous)',
    };
  }
}
