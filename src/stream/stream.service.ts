import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stream, StreamStatus, StreamType } from '../entities/stream.entity';
import { Room } from '../entities/room.entity';
import { User } from '../entities/user.entity';
import { CreateStreamDto, UpdateStreamDto, StreamResponseDto } from '../dto/stream.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StreamService {
  constructor(
    @InjectRepository(Stream)
    private streamRepository: Repository<Stream>,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createStream(userId: string, createStreamDto: CreateStreamDto): Promise<StreamResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const room = await this.roomRepository.findOne({ 
      where: { id: createStreamDto.roomId },
      relations: ['owner']
    });
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Check if user can stream to this room
    if (room.owner.id !== userId) {
      throw new ForbiddenException('Only room owner can create streams');
    }

    const stream = this.streamRepository.create({
      title: createStreamDto.title,
      description: createStreamDto.description,
      type: createStreamDto.type || StreamType.WEBRTC,
      status: StreamStatus.INACTIVE,
      streamer: user,
      room: room,
      webrtcSessionId: uuidv4(),
    });

    const savedStream = await this.streamRepository.save(stream);
    return this.toStreamResponse(savedStream);
  }

  async startStream(userId: string, roomId: string, streamData: any): Promise<Stream> {
    const room = await this.roomRepository.findOne({ 
      where: { id: roomId },
      relations: ['owner']
    });
    
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.owner.id !== userId) {
      throw new ForbiddenException('Only room owner can start streams');
    }

    // Check if there's already an active stream
    const activeStream = await this.streamRepository.findOne({
      where: { 
        room: { id: roomId },
        status: StreamStatus.ACTIVE
      }
    });

    if (activeStream) {
      throw new ForbiddenException('Room already has an active stream');
    }

    // Create new stream
    const stream = this.streamRepository.create({
      title: streamData.title || 'Live Stream',
      description: streamData.description,
      type: streamData.type || StreamType.WEBRTC,
      status: StreamStatus.ACTIVE,
      streamer: { id: userId },
      room: { id: roomId },
      webrtcSessionId: uuidv4(),
      metadata: JSON.stringify(streamData),
    });

    return this.streamRepository.save(stream);
  }

  async stopStream(streamId: string, userId: string): Promise<void> {
    const stream = await this.streamRepository.findOne({
      where: { id: streamId },
      relations: ['streamer']
    });

    if (!stream) {
      throw new NotFoundException('Stream not found');
    }

    if (stream.streamer.id !== userId) {
      throw new ForbiddenException('Only stream owner can stop the stream');
    }

    stream.status = StreamStatus.ENDED;
    stream.endedAt = new Date();
    
    await this.streamRepository.save(stream);
  }

  async updateStream(streamId: string, userId: string, updateStreamDto: UpdateStreamDto): Promise<StreamResponseDto> {
    const stream = await this.streamRepository.findOne({
      where: { id: streamId },
      relations: ['streamer', 'room']
    });

    if (!stream) {
      throw new NotFoundException('Stream not found');
    }

    if (stream.streamer.id !== userId) {
      throw new ForbiddenException('Only stream owner can update the stream');
    }

    Object.assign(stream, updateStreamDto);
    const updatedStream = await this.streamRepository.save(stream);
    
    return this.toStreamResponse(updatedStream);
  }

  async getStreamById(streamId: string): Promise<StreamResponseDto> {
    const stream = await this.streamRepository.findOne({
      where: { id: streamId },
      relations: ['streamer', 'room']
    });

    if (!stream) {
      throw new NotFoundException('Stream not found');
    }

    return this.toStreamResponse(stream);
  }

  async getStreamsByRoom(roomId: string): Promise<StreamResponseDto[]> {
    const streams = await this.streamRepository.find({
      where: { room: { id: roomId } },
      relations: ['streamer', 'room'],
      order: { createdAt: 'DESC' }
    });

    return streams.map(stream => this.toStreamResponse(stream));
  }

  async getActiveStreams(): Promise<StreamResponseDto[]> {
    const streams = await this.streamRepository.find({
      where: { status: StreamStatus.ACTIVE },
      relations: ['streamer', 'room'],
      order: { createdAt: 'DESC' }
    });

    return streams.map(stream => this.toStreamResponse(stream));
  }

  private toStreamResponse(stream: Stream): StreamResponseDto {
    return {
      id: stream.id,
      title: stream.title,
      description: stream.description,
      status: stream.status,
      type: stream.type,
      viewerCount: stream.viewerCount,
      rtmpUrl: stream.rtmpUrl,
      hlsUrl: stream.hlsUrl,
      webrtcSessionId: stream.webrtcSessionId,
      streamer: {
        id: stream.streamer.id,
        username: stream.streamer.username,
      },
      room: {
        id: stream.room.id,
        name: stream.room.name,
      },
      createdAt: stream.createdAt,
    };
  }
}
