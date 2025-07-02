# Streaming Client SDK

This is a client SDK for connecting to the custom streaming server.

## Installation

```bash
npm install socket.io-client
```

## Usage

```javascript
import { StreamingClient } from './streaming-client';

const client = new StreamingClient('http://localhost:3000');

// Authenticate
await client.authenticate('your-jwt-token');

// Join a room
await client.joinRoom('room-id');

// Start streaming (WebRTC)
await client.startWebRTCStream('room-id', localMediaStream);

// Listen for events
client.on('stream-started', (data) => {
  console.log('Stream started:', data);
});
```

---

# 📱 Android Integration Guide

This section explains how to use the streaming server in your Android mobile application. You can stream video to the server (as a broadcaster) or play streams (as a viewer) using RTMP/HLS or WebRTC.

## 1. RTMP Streaming (Broadcaster)

### Native Android (Java/Kotlin)

Use a library like [LFLiveKit](https://github.com/LaiFengiOS/LFLiveKit) (iOS) or [NodeMediaClient-Android](https://github.com/NodeMedia/NodeMediaClient-Android) or [Pili-RTMP](https://github.com/pili-engineering/PLDroidMediaStreaming) for Android.

#### Example with NodeMediaClient-Android

1. **Add Dependency**
   ```gradle
   implementation 'com.nodeandroid:node-media-client:2.9.1'
   ```
2. **Initialize and Start Streaming**
   ```java
   NodePublisher publisher = new NodePublisher(this, "rtmp://localhost:1935/live/STREAM_KEY");
   publisher.setCameraPreview(previewView);
   publisher.start();
   ```
   - Replace `STREAM_KEY` with a valid key (e.g., `test123`).
   - Use your server's public IP/domain for production.

3. **Authentication**
   - The server will only accept valid stream keys. Obtain a key via your backend or API.

## 2. HLS Playback (Viewer)

Use any HLS-compatible video player, such as [ExoPlayer](https://github.com/google/ExoPlayer).

```java
String hlsUrl = "http://your-server:8001/live/STREAM_KEY/index.m3u8";
// Use ExoPlayer to play hlsUrl
```

## 3. WebRTC Streaming (Advanced)

For real-time, low-latency streaming, use WebRTC. You can use [react-native-webrtc](https://github.com/react-native-webrtc/react-native-webrtc) for React Native or [libwebrtc](https://webrtc.github.io/) for native Android.

### React Native Example

1. **Install**
   ```bash
   npm install react-native-webrtc socket.io-client
   ```
2. **Connect to Signaling Server**
   ```js
   import io from 'socket.io-client';
   const socket = io('http://your-server:3000');
   // Use socket to exchange WebRTC signaling data
   ```
3. **Use react-native-webrtc for media**
   ```js
   import { RTCPeerConnection, mediaDevices } from 'react-native-webrtc';
   // Set up peer connection and media stream
   ```

### Native Android (libwebrtc)
- Integrate [libwebrtc](https://webrtc.github.io/) and connect to the server's WebSocket for signaling.
- Follow the signaling protocol as described in the server's WebSocket API section.

## 4. Authentication & Stream Key Management
- Use your backend or the server's REST API to register/login and obtain a JWT token.
- Use the API to create a stream and get a valid stream key.
- Use this key in your RTMP publisher or WebRTC session.

## 5. Example API Usage (Register/Login/Get Stream Key)

```http
POST /api/auth/register
POST /api/auth/login
POST /api/streams (with JWT)
GET /api/media/stream-info/:streamKey
```

## 6. Security & Production Notes
- Always use your server's public IP or domain in production.
- Use HTTPS/WSS for secure connections.
- Protect stream keys and JWT tokens in your app.

---

For more details, see the main server README and the client SDK usage above.
