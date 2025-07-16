import { IsString, IsOptional, IsEnum } from 'class-validator';
import { StreamType } from '../entities/stream.entity';

export class CreateStreamDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  roomId: string;

  @IsOptional()
  @IsEnum(StreamType)
  type?: StreamType;
}

export class UpdateStreamDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class StreamResponseDto {
  id: string;
  title: string;
  description?: string;
  status: string;
  type: StreamType;
  viewerCount: number;
  rtmpUrl?: string;
  hlsUrl?: string;
  webrtcSessionId?: string;
  streamKey?: string;
  streamer: {
    id: string;
    username: string;
  };
  room: {
    id: string;
    name: string;
  };
  createdAt: Date;
}

export class WebRTCSignalDto {
  @IsString()
  streamId: string;

  @IsString()
  type: 'offer' | 'answer' | 'ice-candidate';

  @IsOptional()
  data?: any;
}
