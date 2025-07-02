import { Module } from '@nestjs/common';
import { StreamGateway } from './stream.gateway';
import { StreamModule } from '../stream/stream.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [StreamModule, AuthModule],
  providers: [StreamGateway],
})
export class GatewayModule {}
