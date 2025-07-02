import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StreamService } from '../stream/stream.service';
import { WebRTCSignalDto } from '../dto/stream.dto';

interface AuthenticatedSocket extends Socket {
  user?: any;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class StreamGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(StreamGateway.name);
  private rooms = new Map<string, Set<string>>();
  private userSockets = new Map<string, string>();

  constructor(private streamService: StreamService) {}

  async handleConnection(client: AuthenticatedSocket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Clean up user from rooms
    if (client.user) {
      this.userSockets.delete(client.user.id);
      this.leaveAllRooms(client);
    }
  }

  @SubscribeMessage('authenticate')
  async handleAuthenticate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { token: string },
  ) {
    try {
      // Simple token validation - in production, use proper JWT validation
      const user = await this.validateToken(data.token);
      client.user = user;
      this.userSockets.set(user.id, client.id);
      
      client.emit('authenticated', { success: true, user });
      this.logger.log(`User ${user.username} authenticated`);
    } catch (error) {
      client.emit('authenticated', { success: false, error: error.message });
      client.disconnect();
    }
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string },
  ) {
    if (!client.user) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    const { roomId } = data;
    
    // Add user to room
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    
    this.rooms.get(roomId)!.add(client.id);
    client.join(roomId);
    
    // Notify other users in the room
    client.to(roomId).emit('user-joined', {
      userId: client.user.id,
      username: client.user.username,
    });

    // Send current room users to the new user
    const roomUsers = Array.from(this.rooms.get(roomId)!).map(socketId => {
      const socket = this.server.sockets.sockets.get(socketId) as AuthenticatedSocket;
      return socket?.user ? { id: socket.user.id, username: socket.user.username } : null;
    }).filter(Boolean);

    client.emit('room-joined', { roomId, users: roomUsers });
    
    this.logger.log(`User ${client.user.username} joined room ${roomId}`);
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string },
  ) {
    const { roomId } = data;
    this.leaveRoom(client, roomId);
  }

  @SubscribeMessage('webrtc-signal')
  handleWebRTCSignal(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: WebRTCSignalDto & { targetUserId?: string, roomId: string },
  ) {
    if (!client.user) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    const { targetUserId, roomId, ...signalData } = data;

    if (targetUserId) {
      // Direct peer-to-peer signal
      const targetSocketId = this.userSockets.get(targetUserId);
      if (targetSocketId) {
        this.server.to(targetSocketId).emit('webrtc-signal', {
          ...signalData,
          fromUserId: client.user.id,
          fromUsername: client.user.username,
        });
      }
    } else {
      // Broadcast to room
      client.to(roomId).emit('webrtc-signal', {
        ...signalData,
        fromUserId: client.user.id,
        fromUsername: client.user.username,
      });
    }
  }

  @SubscribeMessage('start-stream')
  async handleStartStream(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string, streamData: any },
  ) {
    if (!client.user) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    try {
      // Create stream record
      const stream = await this.streamService.startStream(
        client.user.id,
        data.roomId,
        data.streamData,
      );

      // Notify room about new stream
      this.server.to(data.roomId).emit('stream-started', {
        streamId: stream.id,
        streamerId: client.user.id,
        streamerName: client.user.username,
      });

      client.emit('stream-start-success', { streamId: stream.id });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('stop-stream')
  async handleStopStream(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { streamId: string, roomId: string },
  ) {
    if (!client.user) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    try {
      await this.streamService.stopStream(data.streamId, client.user.id);
      
      this.server.to(data.roomId).emit('stream-stopped', {
        streamId: data.streamId,
      });

      client.emit('stream-stop-success');
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  private leaveRoom(client: AuthenticatedSocket, roomId: string) {
    if (this.rooms.has(roomId)) {
      this.rooms.get(roomId)!.delete(client.id);
      
      if (this.rooms.get(roomId)!.size === 0) {
        this.rooms.delete(roomId);
      }
    }
    
    client.leave(roomId);
    
    if (client.user) {
      client.to(roomId).emit('user-left', {
        userId: client.user.id,
        username: client.user.username,
      });
    }
  }

  private leaveAllRooms(client: AuthenticatedSocket) {
    for (const [roomId, users] of this.rooms.entries()) {
      if (users.has(client.id)) {
        this.leaveRoom(client, roomId);
      }
    }
  }

  private async validateToken(token: string): Promise<any> {
    // In production, use proper JWT validation with AuthService
    // This is a simplified version
    if (!token) {
      throw new Error('No token provided');
    }
    
    // Mock user for development
    return {
      id: 'user-' + Date.now(),
      username: 'developer',
    };
  }
}
