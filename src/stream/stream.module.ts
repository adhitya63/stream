import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StreamService } from './stream.service';
import { StreamController } from './stream.controller';
import { Stream } from '../entities/stream.entity';
import { Room } from '../entities/room.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Stream, Room, User])],
  providers: [StreamService],
  controllers: [StreamController],
  exports: [StreamService],
})
export class StreamModule {}
