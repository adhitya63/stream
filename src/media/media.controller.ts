import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('stream-info/:streamKey')
  getStreamInfo(@Param('streamKey') streamKey: string) {
    return this.mediaService.getStreamInfo(streamKey);
  }

  @Get('server-status')
  getServerStatus() {
    return this.mediaService.getServerStatus();
  }
}
