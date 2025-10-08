import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CircuitBreakerUtility } from './resilience/circuit-breaker.utility';

interface UserPayloadV1 {
  id: string;
  email: string;
  firstName: string;
  traceId: string;
}

@Controller()
export class PaymentUserHandler {
  private readonly globalLogger = new Logger(PaymentUserHandler.name);
  private simulationFailureCounter = 0;

  constructor(private readonly circuitBreaker: CircuitBreakerUtility<string>) {
    this.circuitBreaker.setProtectedFunction(() => this.checkInventorySync());
  }

  /**
   * Este método escucha el patrón TCP que envía el servicio de Usuarios.
   */
  @MessagePattern({ cmd: 'user.created' })
  async handleUserCreated(@Payload() data: UserPayloadV1): Promise<string> {
    const contextLogger = new Logger(`Payments [Trace:${data.traceId}]`);

    contextLogger.log(`\n<<< [PAYMENTS SVC] Mensaje Recibido (TCP) >>>`);

    // --- Lógica de Idempotencia (Simulación) ---
    const isProcessed = await this.checkIfProcessed(data.traceId);
    if (isProcessed) {
      contextLogger.warn(
        `[Payments] Evento ${data.traceId} ya fue procesado. Ignorando.`,
      );
      return `Evento ${data.traceId} ignorado por idempotencia.`;
    }

    // --- Integración Síncrona Protegida ---
    try {
      contextLogger.log(
        `[Payments] Intentando llamada SÍNCRONA a Inventario (protegida por Circuit Breaker)...`,
      );

      // La llamada protegida: si falla 3 veces, entra en modo OPEN.
      const inventoryStatus = await this.circuitBreaker.execute();
      contextLogger.log(
        `[Payments] Respuesta de Inventario: ${inventoryStatus}`,
      );

      // Si todo sale bien
      await this.paymentsDatabaseUpdate(data);
      await this.markAsProcessed(data.traceId);

      contextLogger.log(
        `[Payments] Usuario ${data.id} sincronizado con éxito.`,
      );
      return `Usuario ${data.id} sincronizado exitosamente.`;
    } catch (error) {
      // 1. Manejo del Circuit Breaker en estado OPEN
      if (error.message.includes('Circuit Breaker is OPEN')) {
        contextLogger.error(
          `[Payments] CIRCUIT BREAKER ABIERTO. Fallo síncrono manejado con gracia (Fallback).`,
        );
        return `Usuario ${data.id} procesado parcialmente (Fallback: Inventario no disponible).`;
      }

      // 2. Manejo de fallos controlados (Circuit Breaker en estado CLOSED)
      if (error.message.includes('Servicio de Inventario no disponible.')) {
        contextLogger.warn(
          `[Payments] Fallo controlado: El Circuit Breaker registró el fallo y continuará.`,
        );
        return `Usuario ${data.id} pendiente. Falla síncrona registrada por CB.`;
      }

      // 3. Fallo CRÍTICO NO CONTROLADO
      contextLogger.error(
        `[Payments] Fallo CRÍTICO y no controlado: ${error.message}`,
      );
      throw new Error(`Fallo CRÍTICO en Pagos: ${error.message}`);
    }
  }

  // --- LÓGICA DE SIMULACIÓN ---
  private async checkInventorySync(): Promise<string> {
    this.simulationFailureCounter++;

    // Fallar las primeras 3 veces.
    if (this.simulationFailureCounter <= 3) {
      this.globalLogger.warn(
        `[Payments: Inventario Mock] FALLO SIMULADO #${this.simulationFailureCounter}.`,
      );
      throw new Error('Servicio de Inventario no disponible.');
    }

    // Recuperación para la prueba HALF-OPEN
    this.globalLogger.log(
      `[Payments: Inventario Mock] Llamada síncrona exitosa (¡Recuperado!).`,
    );
    return 'INVENTORY_CHECK_OK';
  }

  private async checkIfProcessed(traceId: string): Promise<boolean> {
    return false;
  }
  private async markAsProcessed(traceId: string): Promise<void> {
    return;
  }
  private async paymentsDatabaseUpdate(data: UserPayloadV1): Promise<void> {
    return;
  }
}
