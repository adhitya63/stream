import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, ValidationPipe } from '@nestjs/common';
import { StreamService } from './stream.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateStreamDto, UpdateStreamDto } from '../dto/stream.dto';

@Controller('streams')
@UseGuards(JwtAuthGuard)
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  @Post()
  async createStream(
    @Request() req,
    @Body(ValidationPipe) createStreamDto: CreateStreamDto,
  ) {
    return this.streamService.createStream(req.user.id, createStreamDto);
  }

  @Get(':id')
  async getStream(@Param('id') id: string) {
    return this.streamService.getStreamById(id);
  }

  @Put(':id')
  async updateStream(
    @Param('id') id: string,
    @Request() req,
    @Body(ValidationPipe) updateStreamDto: UpdateStreamDto,
  ) {
    return this.streamService.updateStream(id, req.user.id, updateStreamDto);
  }

  @Get('room/:roomId')
  async getStreamsByRoom(@Param('roomId') roomId: string) {
    return this.streamService.getStreamsByRoom(roomId);
  }

  @Get()
  async getActiveStreams() {
    return this.streamService.getActiveStreams();
  }
}
