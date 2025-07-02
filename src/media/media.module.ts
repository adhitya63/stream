import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { StreamModule } from '../stream/stream.module';
import { RoomModule } from '../room/room.module';

@Module({
  imports: [StreamModule, RoomModule],
  providers: [MediaService],
  controllers: [MediaController],
  exports: [MediaService],
})
export class MediaModule {}
