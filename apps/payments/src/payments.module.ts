import { Module } from '@nestjs/common';
import { PaymentsManagement } from './payments-management';
import { PaymentUserHandler } from './payment-user.handler';
import { CircuitBreakerUtility } from './resilience/circuit-breaker.utility';

@Module({
  imports: [],
  controllers: [PaymentsManagement, PaymentUserHandler],
  providers: [CircuitBreakerUtility],
})
export class PaymentsModule {}
