import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, ValidationPipe } from '@nestjs/common';
import { RoomService } from './room.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateRoomDto, UpdateRoomDto } from '../dto/room.dto';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createRoom(
    @Request() req,
    @Body(ValidationPipe) createRoomDto: CreateRoomDto,
  ) {
    return this.roomService.createRoom(req.user.id, createRoomDto);
  }

  @Get(':id')
  async getRoom(@Param('id') id: string) {
    return this.roomService.getRoomById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateRoom(
    @Param('id') id: string,
    @Request() req,
    @Body(ValidationPipe) updateRoomDto: UpdateRoomDto,
  ) {
    return this.roomService.updateRoom(id, req.user.id, updateRoomDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteRoom(@Param('id') id: string, @Request() req) {
    await this.roomService.deleteRoom(id, req.user.id);
    return { message: 'Room deleted successfully' };
  }

  @Get('user/my-rooms')
  @UseGuards(JwtAuthGuard)
  async getMyRooms(@Request() req) {
    return this.roomService.getRoomsByUser(req.user.id);
  }

  @Get()
  async getPublicRooms() {
    return this.roomService.getPublicRooms();
  }
}
