import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MercadoPagoService } from './mercadopago.service';
import { MercadoPagoController } from './mercadopago.controller';
import { PaymentsInboundController } from './payments-inbound.controller';
import { PaymentsInboundService } from './payments-inbound.service';
import { PaymentSource } from '../common/entities/payment-source.entity';
import { Subscription } from '../user/entities/subscription.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    TypeOrmModule.forFeature([PaymentSource, Subscription]),
  ],
  providers: [MercadoPagoService, PaymentsInboundService],
  controllers: [MercadoPagoController, PaymentsInboundController],
  exports: [MercadoPagoService],
})
export class MercadoPagoModule {}
