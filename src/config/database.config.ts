import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Room } from '../entities/room.entity';
import { Stream } from '../entities/stream.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: 'streaming.db',
  entities: [User, Room, Stream],
  synchronize: true, // Only for development
  logging: false,
};
