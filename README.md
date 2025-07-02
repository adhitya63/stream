# Custom Streaming Server

A comprehensive NestJS-based streaming server that provides WebRTC signaling, RTMP streaming, and real-time communication capabilities to replace GetStream functionality.

## Features

### 🚀 Core Streaming Capabilities
- **WebRTC Signaling**: Real-time peer-to-peer streaming with Socket.IO
- **RTMP Server**: Traditional streaming protocol support for OBS/Streamlabs
- **HLS Streaming**: HTTP Live Streaming for broad compatibility
- **Media Relay**: Stream recording and relay capabilities

### 🏠 Room Management
- **Public/Private Rooms**: Create and manage streaming rooms
- **Viewer Limits**: Control maximum concurrent viewers
- **Room Permissions**: Owner-based access control
- **Stream Keys**: Secure RTMP streaming with unique keys

### 🔐 Authentication & Security
- **JWT Authentication**: Secure user authentication
- **Role-based Access**: Stream ownership and permissions
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Comprehensive request validation

### 📡 Real-time Communication
- **Socket.IO Gateway**: WebSocket-based real-time events
- **User Presence**: Track online users in rooms
- **Stream Events**: Live notifications for stream start/stop
- **WebRTC Signaling**: ICE candidate exchange for peer connections

## Project Structure

```
src/
├── auth/           # JWT authentication module
├── config/         # Database and app configuration
├── dto/            # Data transfer objects for validation
├── entities/       # TypeORM database entities
├── gateway/        # WebSocket gateway for real-time communication
├── media/          # RTMP/HLS media server management
├── room/           # Room management module
└── stream/         # Stream management module

client-sdk/         # Client SDK for frontend integration
```

## Quick Start

### 1. Environment Setup

Copy the environment template:
```bash
cp .env.example .env
```

Configure your environment variables in `.env`:
```env
JWT_SECRET=your-super-secret-jwt-key
PORT=3000
RTMP_PORT=1935
HTTP_MEDIA_PORT=8000
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build the Project

```bash
npm run build
```

### 4. Start the Server

```bash
npm run start:dev
```

The server will start with:
- **REST API**: http://localhost:3000/api
- **WebSocket Gateway**: ws://localhost:3000
- **RTMP Server**: rtmp://localhost:1935
- **HLS Server**: http://localhost:8000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Rooms
- `GET /api/rooms` - Get public rooms
- `POST /api/rooms` - Create a new room
- `GET /api/rooms/:id` - Get room details
- `PUT /api/rooms/:id` - Update room
- `DELETE /api/rooms/:id` - Delete room

### Streams
- `GET /api/streams` - Get active streams
- `POST /api/streams` - Create a new stream
- `GET /api/streams/:id` - Get stream details
- `PUT /api/streams/:id` - Update stream

### Media
- `GET /api/media/stream-info/:streamKey` - Get RTMP/HLS URLs
- `GET /api/media/server-status` - Get media server status

## WebSocket Events

### Client to Server
- `authenticate` - Authenticate with JWT token
- `join-room` - Join a streaming room
- `leave-room` - Leave a streaming room
- `start-stream` - Start streaming
- `stop-stream` - Stop streaming
- `webrtc-signal` - Send WebRTC signaling data

### Server to Client
- `authenticated` - Authentication result
- `room-joined` - Successfully joined room
- `user-joined` - Another user joined the room
- `user-left` - User left the room
- `stream-started` - Stream started in room
- `stream-stopped` - Stream stopped in room
- `webrtc-signal` - WebRTC signaling data

## Streaming Integration

### For Streamers (RTMP)

Use streaming software like OBS Studio:
1. **Server**: `rtmp://localhost:1935/live`
2. **Stream Key**: Get from `/api/media/stream-info/:streamKey`

### For Viewers (HLS)

Access streams via:
- **HLS URL**: `http://localhost:8000/live/:streamKey/index.m3u8`

### For Web Applications (WebRTC)

Use the included client SDK:

```javascript
import { StreamingClient } from './client-sdk/streaming-client';

const client = new StreamingClient('http://localhost:3000');

// Authenticate
await client.authenticate('jwt-token');

// Join room
await client.joinRoom('room-id');

// Listen for streams
client.on('stream-started', (data) => {
  console.log('New stream:', data);
});
```

## Database Schema

The application uses SQLite with TypeORM:

- **Users**: Authentication and user management
- **Rooms**: Streaming room configuration
- **Streams**: Active and historical streams

## Development

### Running Tests

```bash
npm run test
npm run test:e2e
```

### Development Mode

```bash
npm run start:dev
```

### Production Build

```bash
npm run build
npm run start:prod
```

## Deployment Considerations

### Environment Variables
- Set strong `JWT_SECRET` in production
- Configure proper CORS origins
- Set up SSL/TLS for HTTPS/WSS

### Scaling
- Use Redis for WebSocket scaling across instances
- Configure load balancer for multiple server instances
- Consider CDN for HLS stream distribution

### Security
- Implement rate limiting
- Use HTTPS/WSS in production
- Validate all user inputs
- Monitor for abuse and unauthorized access

## Client SDK

The `client-sdk` directory contains a TypeScript SDK for frontend integration:

```bash
cd client-sdk
npm install
npm run build
```

Use in your frontend application to easily connect to the streaming server.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
