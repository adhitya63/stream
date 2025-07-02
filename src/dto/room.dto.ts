import { IsString, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { RoomType } from '../entities/room.entity';

export class CreateRoomDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(RoomType)
  type?: RoomType;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10000)
  maxViewers?: number;
}

export class UpdateRoomDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(RoomType)
  type?: RoomType;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10000)
  maxViewers?: number;
}

export class RoomResponseDto {
  id: string;
  name: string;
  description?: string;
  type: RoomType;
  viewerCount: number;
  maxViewers: number;
  isActive: boolean;
  thumbnail?: string;
  streamKey?: string;
  owner: {
    id: string;
    username: string;
  };
  createdAt: Date;
}
