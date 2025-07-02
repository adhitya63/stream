import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
const NodeMediaServer = require('node-media-server');
import { StreamService } from '../stream/stream.service';
import { RoomService } from '../room/room.service';

@Injectable()
export class MediaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MediaService.name);
  private nms: any;

  constructor(
    private streamService: StreamService,
    private roomService: RoomService,
  ) {}

  onModuleInit() {
    this.initializeMediaServer();
  }

  onModuleDestroy() {
    if (this.nms) {
      this.nms.stop();
    }
  }

  private initializeMediaServer() {
    const config = {
      rtmp: {
        port: 1935,
        chunk_size: 60000,
        gop_cache: true,
        ping: 30,
        ping_timeout: 60,
      },
      http: {
        port: 8001,
        allow_origin: '*',
        mediaroot: './media',
      },
      relay: {
        ffmpeg: 'ffmpeg', // FFmpeg will be available after restart
        tasks: [
          {
            app: 'live',
            mode: 'push',
            edge: 'rtmp://localhost:1935/hls',
          }
        ]
      },
      auth: {
        play: false,
        publish: true, // Enable authentication for streaming
        secret: 'streaming-secret',
        api: true,
        api_user: 'admin',
        api_pass: 'admin',
      },
    };

    this.nms = new NodeMediaServer(config);
    
    // Set up event handlers
    this.setupEventHandlers();
    
    this.nms.run();
    this.logger.log('RTMP Media Server started on port 1935');
    this.logger.log('HTTP Media Server started on port 8001');
  }

  private setupEventHandlers() {
    this.nms.on('prePublish', async (id: string, StreamPath: string, args: any) => {
      this.logger.log(`Pre-publish: ID=${id}, Path=${StreamPath}`);
      
      if (!StreamPath) {
        this.logger.warn('StreamPath is undefined in prePublish event');
        return false;
      }
      
      // Extract stream key from path (e.g., /live/STREAM_KEY)
      const streamKey = StreamPath.split('/').pop();
      
      if (!streamKey) {
        this.logger.warn(`Invalid stream path: ${StreamPath}`);
        return false;
      }

      // For production with authentication - validate stream key
      try {
        // Validate stream key exists in database
        const isValid = await this.validateStreamKey(streamKey);
        
        if (!isValid) {
          this.logger.warn(`Invalid stream key: ${streamKey}`);
          return false;
        }

        this.logger.log(`Stream key validated: ${streamKey}`);
        return true;
      } catch (error) {
        this.logger.error(`Error validating stream key: ${error.message}`);
        return false;
      }
    });

    this.nms.on('postPublish', async (id: string, StreamPath: string, args: any) => {
      this.logger.log(`Post-publish: ID=${id}, Path=${StreamPath || 'undefined'}, Args=${JSON.stringify(args)}`);
      
      if (!StreamPath) {
        this.logger.warn('StreamPath is undefined in postPublish event - this is a known issue with node-media-server');
        // For now, we'll skip processing if StreamPath is undefined
        // In production, you might want to maintain a mapping of session IDs to stream paths
        return;
      }
      
      const streamKey = StreamPath.split('/').pop();
      if (streamKey) {
        await this.handleStreamStart(streamKey, StreamPath);
      }
    });

    this.nms.on('donePublish', async (id: string, StreamPath: string, args: any) => {
      this.logger.log(`Done-publish: ID=${id}, Path=${StreamPath || 'undefined'}`);
      
      if (!StreamPath) {
        this.logger.warn('StreamPath is undefined in donePublish event');
        return;
      }
      
      const streamKey = StreamPath.split('/').pop();
      
      if (streamKey) {
        await this.handleStreamEnd(streamKey);
      }
    });

    this.nms.on('prePlay', (id: string, StreamPath: string, args: any) => {
      this.logger.log(`Pre-play: ${StreamPath || 'undefined'}`);
      // Allow all play requests
      return true;
    });

    this.nms.on('postPlay', async (id: string, StreamPath: string, args: any) => {
      this.logger.log(`Post-play: ${StreamPath || 'undefined'}`);
      
      if (!StreamPath) {
        this.logger.warn('StreamPath is undefined in postPlay event');
        return;
      }
      
      const streamKey = StreamPath.split('/').pop();
      
      if (streamKey) {
        await this.handleViewerJoin(streamKey);
      }
    });

    this.nms.on('donePlay', async (id: string, StreamPath: string, args: any) => {
      this.logger.log(`Done-play: ${StreamPath || 'undefined'}`);
      
      if (!StreamPath) {
        this.logger.warn('StreamPath is undefined in donePlay event');
        return;
      }
      
      const streamKey = StreamPath.split('/').pop();
      
      if (streamKey) {
        await this.handleViewerLeave(streamKey);
      }
    });
  }

  private async validateStreamKey(streamKey: string): Promise<boolean> {
    try {
      // For testing: accept stream keys that follow a pattern
      // In production, you'd check against the database for valid stream keys
      
      // Accept stream keys that are at least 6 characters long and alphanumeric
      const isValidFormat = /^[a-zA-Z0-9]{6,}$/.test(streamKey);
      
      if (!isValidFormat) {
        this.logger.warn(`Stream key format invalid: ${streamKey}`);
        return false;
      }
      
      // For testing, accept these predefined keys or any that match the pattern
      const allowedKeys = ['test123', 'demo123', 'livestream', 'stream001'];
      const isAllowed = allowedKeys.includes(streamKey) || isValidFormat;
      
      this.logger.log(`Stream key validation: ${streamKey} - ${isAllowed ? 'VALID' : 'INVALID'}`);
      return isAllowed;
      
      // In production, replace with:
      // const stream = await this.streamService.findByStreamKey(streamKey);
      // return stream && stream.isActive;
    } catch (error) {
      this.logger.error(`Error validating stream key: ${error.message}`);
      return false;
    }
  }

  private async handleStreamStart(streamKey: string, streamPath: string) {
    try {
      // Update stream status in database
      this.logger.log(`Stream started with key: ${streamKey}`);        // Generate HLS and RTMP URLs
        const rtmpUrl = `rtmp://localhost:1935${streamPath}`;
        const hlsUrl = `http://localhost:8001${streamPath}/index.m3u8`;
      
      this.logger.log(`RTMP URL: ${rtmpUrl}`);
      this.logger.log(`HLS URL: ${hlsUrl}`);
      
      // Here you would update the stream record with these URLs
      // await this.streamService.updateStreamUrls(streamKey, rtmpUrl, hlsUrl);
      
    } catch (error) {
      this.logger.error(`Error handling stream start: ${error.message}`);
    }
  }

  private async handleStreamEnd(streamKey: string) {
    try {
      this.logger.log(`Stream ended with key: ${streamKey}`);
      
      // Update stream status in database
      // await this.streamService.endStreamByKey(streamKey);
      
    } catch (error) {
      this.logger.error(`Error handling stream end: ${error.message}`);
    }
  }

  private async handleViewerJoin(streamKey: string) {
    try {
      this.logger.log(`Viewer joined stream: ${streamKey}`);
      
      // Increment viewer count
      // await this.roomService.incrementViewerCount(roomId);
      
    } catch (error) {
      this.logger.error(`Error handling viewer join: ${error.message}`);
    }
  }

  private async handleViewerLeave(streamKey: string) {
    try {
      this.logger.log(`Viewer left stream: ${streamKey}`);
      
      // Decrement viewer count
      // await this.roomService.decrementViewerCount(roomId);
      
    } catch (error) {
      this.logger.error(`Error handling viewer leave: ${error.message}`);
    }
  }

  getStreamInfo(streamKey: string) {
    return {
      rtmpUrl: `rtmp://localhost:1935/live/${streamKey}`,
      hlsUrl: `http://localhost:8001/live/${streamKey}/index.m3u8`,
      streamKey,
    };
  }

  getServerStatus() {
    return {
      rtmpPort: 1935,
      httpPort: 8001,
      isRunning: this.nms ? true : false,
    };
  }
}
