# Copilot Instructions for Streaming Server

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a NestJS-based streaming server designed to replace GetStream functionality. The server provides:

- **WebRTC Signaling**: Real-time peer-to-peer streaming capabilities
- **RTMP Server**: Traditional streaming protocol support
- **Room Management**: Organize streams into rooms/channels
- **Authentication**: JWT-based user authentication
- **Media Processing**: Stream recording and relay capabilities
- **Socket.IO Integration**: Real-time communication between clients

## Architecture Guidelines

### Code Style
- Use TypeScript strict mode
- Follow NestJS conventions (modules, controllers, services, guards)
- Use dependency injection for all services
- Implement proper error handling with custom exceptions
- Use DTOs for request/response validation

### Streaming Patterns
- Use WebSockets for real-time signaling
- Implement proper ICE candidate handling for WebRTC
- Use event-driven architecture for stream lifecycle management
- Implement proper cleanup for disconnected streams

### Security
- Always validate user permissions for room access
- Implement rate limiting for streaming endpoints
- Use JWT tokens for authentication
- Sanitize user inputs and stream metadata

### Performance
- Use Redis for session management (if scaling)
- Implement proper memory management for media streams
- Use connection pooling for database operations
- Monitor and log stream performance metrics

## Key Components
- **AuthModule**: Handles user authentication and authorization
- **StreamModule**: Manages streaming functionality
- **RoomModule**: Handles room/channel management
- **GatewayModule**: WebSocket/Socket.IO gateway for real-time communication
- **MediaModule**: Handles RTMP server and media processing

## Environment Configuration
- Use @nestjs/config for environment variables
- Separate configurations for development, staging, and production
- Store sensitive data in environment files (not committed to git)
