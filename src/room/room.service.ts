import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room, RoomType } from '../entities/room.entity';
import { User } from '../entities/user.entity';
import { CreateRoomDto, UpdateRoomDto, RoomResponseDto } from '../dto/room.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createRoom(userId: string, createRoomDto: CreateRoomDto): Promise<RoomResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const room = this.roomRepository.create({
      name: createRoomDto.name,
      description: createRoomDto.description,
      type: createRoomDto.type || RoomType.PUBLIC,
      maxViewers: createRoomDto.maxViewers || 100,
      owner: user,
      streamKey: uuidv4(), // Generate unique stream key
    });

    const savedRoom = await this.roomRepository.save(room);
    return this.toRoomResponse(savedRoom);
  }

  async updateRoom(roomId: string, userId: string, updateRoomDto: UpdateRoomDto): Promise<RoomResponseDto> {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ['owner']
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.owner.id !== userId) {
      throw new ForbiddenException('Only room owner can update the room');
    }

    Object.assign(room, updateRoomDto);
    const updatedRoom = await this.roomRepository.save(room);
    
    return this.toRoomResponse(updatedRoom);
  }

  async getRoomById(roomId: string): Promise<RoomResponseDto> {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ['owner']
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return this.toRoomResponse(room);
  }

  async getRoomsByUser(userId: string): Promise<RoomResponseDto[]> {
    const rooms = await this.roomRepository.find({
      where: { owner: { id: userId } },
      relations: ['owner'],
      order: { createdAt: 'DESC' }
    });

    return rooms.map(room => this.toRoomResponse(room));
  }

  async getPublicRooms(): Promise<RoomResponseDto[]> {
    const rooms = await this.roomRepository.find({
      where: { 
        type: RoomType.PUBLIC,
        isActive: true 
      },
      relations: ['owner'],
      order: { viewerCount: 'DESC' }
    });

    return rooms.map(room => this.toRoomResponse(room));
  }

  async deleteRoom(roomId: string, userId: string): Promise<void> {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ['owner']
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.owner.id !== userId) {
      throw new ForbiddenException('Only room owner can delete the room');
    }

    await this.roomRepository.remove(room);
  }

  async incrementViewerCount(roomId: string): Promise<void> {
    await this.roomRepository.increment({ id: roomId }, 'viewerCount', 1);
  }

  async decrementViewerCount(roomId: string): Promise<void> {
    await this.roomRepository.decrement({ id: roomId }, 'viewerCount', 1);
  }

  private toRoomResponse(room: Room): RoomResponseDto {
    return {
      id: room.id,
      name: room.name,
      description: room.description,
      type: room.type,
      viewerCount: room.viewerCount,
      maxViewers: room.maxViewers,
      isActive: room.isActive,
      thumbnail: room.thumbnail,
      streamKey: room.streamKey,
      owner: {
        id: room.owner.id,
        username: room.owner.username,
      },
      createdAt: room.createdAt,
    };
  }
}
