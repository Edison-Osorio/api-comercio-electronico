import { Logger, Injectable } from '@nestjs/common';

// Definición de los estados del Circuit Breaker
enum CircuitState {
  CLOSED = 'CLOSED', // Operaciones normales, permite el paso de llamadas.
  OPEN = 'OPEN',     // Rechaza rápidamente todas las llamadas (Fail Fast), el sistema externo está caído.
  HALF_OPEN = 'HALF_OPEN', // Permite una llamada de prueba para verificar la recuperación.
}

@Injectable()
// La clase es genérica (<T>) para poder proteger cualquier tipo de función que retorne una promesa.
export class CircuitBreakerUtility<T> {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private readonly failureThreshold: number = 3; // Límite de fallos antes de abrir el circuito
  private readonly resetTimeout: number = 10000; // Tiempo en ms (10s) antes de pasar a HALF_OPEN
  private lastFailureTime: number = 0;
  private readonly logger = new Logger(CircuitBreakerUtility.name);

  // Función que debe ser protegida (se define en el constructor del handler)
  private protectedFunction: () => Promise<T>;

  public setProtectedFunction(fn: () => Promise<T>): void {
    this.protectedFunction = fn;
  }

  /**
   * Punto de entrada: envuelve la llamada a la función protegida con la lógica del cortacircuitos.
   */
  public async execute(): Promise<T> {
    this.logger.log(`[Circuit Breaker] Estado actual: ${this.state}`);

    switch (this.state) {
      case CircuitState.OPEN:
        // Si el tiempo de espera (10s) ha pasado, intentamos pasar a HALF_OPEN
        if (Date.now() > this.lastFailureTime + this.resetTimeout) {
          this.transitionTo(CircuitState.HALF_OPEN);
          // Permitimos que HALF_OPEN maneje el primer intento de prueba.
          return this.execute();
        }
        // Si el tiempo aún no ha pasado, fallamos rápidamente (Fail Fast)
        this.logger.warn(
          `[Circuit Breaker] ABIERTO. Fallando rápidamente. Tiempo restante: ${Math.floor((this.lastFailureTime + this.resetTimeout - Date.now()) / 1000)}s`,
        );
        throw new Error('Circuit Breaker is OPEN. Service unavailable.');

      case CircuitState.HALF_OPEN:
        this.logger.warn(
          `[Circuit Breaker] HALF_OPEN. Enviando una llamada de prueba.`,
        );
        try {
          const result = await this.protectedFunction();
          this.transitionTo(CircuitState.CLOSED); // Éxito: cerrar circuito
          return result;
        } catch (error) {
          this.transitionTo(CircuitState.OPEN); // Fallo: reabrir circuito
          throw error;
        }

      case CircuitState.CLOSED:
        try {
          const result = await this.protectedFunction();
          this.failureCount = 0; // Reiniciar contador tras éxito
          return result;
        } catch (error) {
          this.recordFailure();
          throw error;
        }
    }
  }

  private transitionTo(newState: CircuitState): void {
    this.state = newState;
    this.logger.log(`[Circuit Breaker] Transición de estado a: ${newState}`);
    if (newState === CircuitState.OPEN) {
      this.lastFailureTime = Date.now();
      this.failureCount = 0;
    }
    if (newState === CircuitState.CLOSED) {
      this.failureCount = 0;
    }
  }

  private recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    this.logger.error(
      `[Circuit Breaker] Fallo registrado. Contador: ${this.failureCount}/${this.failureThreshold}`,
    );
    if (this.failureCount >= this.failureThreshold) {
      this.transitionTo(CircuitState.OPEN);
    }
  }
}
