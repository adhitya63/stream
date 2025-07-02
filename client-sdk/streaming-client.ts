import { io, Socket } from 'socket.io-client';

export interface StreamingClientOptions {
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

export interface StreamEvent {
  streamId: string;
  streamerId: string;
  streamerName: string;
}

export interface UserEvent {
  userId: string;
  username: string;
}

export class StreamingClient {
  private socket: Socket;
  private isAuthenticated = false;
  private currentRoom: string | null = null;
  private eventHandlers = new Map<string, Function[]>();

  constructor(
    private serverUrl: string,
    private options: StreamingClientOptions = {}
  ) {
    this.socket = io(serverUrl, {
      autoConnect: options.autoConnect ?? true,
      reconnection: options.reconnection ?? true,
      reconnectionAttempts: options.reconnectionAttempts ?? 5,
      reconnectionDelay: options.reconnectionDelay ?? 1000,
    });

    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to streaming server');
      this.emit('connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from streaming server');
      this.isAuthenticated = false;
      this.currentRoom = null;
      this.emit('disconnected');
    });

    this.socket.on('authenticated', (data) => {
      this.isAuthenticated = data.success;
      if (data.success) {
        console.log('Authentication successful');
        this.emit('authenticated', data.user);
      } else {
        console.error('Authentication failed:', data.error);
        this.emit('authentication-failed', data.error);
      }
    });

    this.socket.on('room-joined', (data) => {
      this.currentRoom = data.roomId;
      this.emit('room-joined', data);
    });

    this.socket.on('user-joined', (data) => {
      this.emit('user-joined', data);
    });

    this.socket.on('user-left', (data) => {
      this.emit('user-left', data);
    });

    this.socket.on('stream-started', (data) => {
      this.emit('stream-started', data);
    });

    this.socket.on('stream-stopped', (data) => {
      this.emit('stream-stopped', data);
    });

    this.socket.on('webrtc-signal', (data) => {
      this.emit('webrtc-signal', data);
    });

    this.socket.on('error', (data) => {
      console.error('Server error:', data);
      this.emit('error', data);
    });
  }

  async authenticate(token: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.socket.emit('authenticate', { token });
      
      const onAuth = (user: any) => {
        this.off('authenticated', onAuth);
        this.off('authentication-failed', onAuthFailed);
        resolve(true);
      };

      const onAuthFailed = (error: any) => {
        this.off('authenticated', onAuth);
        this.off('authentication-failed', onAuthFailed);
        resolve(false);
      };

      this.on('authenticated', onAuth);
      this.on('authentication-failed', onAuthFailed);
    });
  }

  async joinRoom(roomId: string): Promise<void> {
    if (!this.isAuthenticated) {
      throw new Error('Must be authenticated to join room');
    }

    this.socket.emit('join-room', { roomId });
  }

  async leaveRoom(roomId: string): Promise<void> {
    if (!this.isAuthenticated) {
      throw new Error('Must be authenticated to leave room');
    }

    this.socket.emit('leave-room', { roomId });
    this.currentRoom = null;
  }

  async startWebRTCStream(roomId: string, streamData: any): Promise<void> {
    if (!this.isAuthenticated) {
      throw new Error('Must be authenticated to start stream');
    }

    this.socket.emit('start-stream', { roomId, streamData });
  }

  async stopStream(streamId: string, roomId: string): Promise<void> {
    if (!this.isAuthenticated) {
      throw new Error('Must be authenticated to stop stream');
    }

    this.socket.emit('stop-stream', { streamId, roomId });
  }

  sendWebRTCSignal(signal: any, targetUserId?: string): void {
    if (!this.isAuthenticated || !this.currentRoom) {
      throw new Error('Must be authenticated and in a room to send signals');
    }

    this.socket.emit('webrtc-signal', {
      ...signal,
      roomId: this.currentRoom,
      targetUserId,
    });
  }

  // Event handling
  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  // Utility methods
  isConnected(): boolean {
    return this.socket.connected;
  }

  isAuth(): boolean {
    return this.isAuthenticated;
  }

  getCurrentRoom(): string | null {
    return this.currentRoom;
  }

  disconnect(): void {
    this.socket.disconnect();
  }

  connect(): void {
    this.socket.connect();
  }
}
