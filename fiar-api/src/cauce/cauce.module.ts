import { Global, Module } from '@nestjs/common';
import { OlympoHubService } from './hub.service';

/**
 * Olympo ecosystem integration module.
 *
 * Global so any feature module can inject {@link OlympoHubService} to publish
 * Fiar-owned events (credit.*, payment.received) to HubCentral without
 * re-importing this module.
 */
@Global()
@Module({
  providers: [OlympoHubService],
  exports: [OlympoHubService],
})
export class OlympoModule {}
