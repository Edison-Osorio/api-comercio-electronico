import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentUserHandler } from './payment-user.handler';
import { CircuitBreakerUtility } from './resilience/circuit-breaker.utility';

@Module({
  imports: [],
  controllers: [PaymentsController, PaymentUserHandler],
  providers: [
    PaymentsService,
    CircuitBreakerUtility
  ],
})
export class PaymentsModule { }
