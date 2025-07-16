const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

const db = new sqlite3.Database('streaming.db');

// Generate a test stream key
const streamKey = 'test12345';
const streamId = uuidv4();
const userId = 'dce2e997-ac10-4c6e-b5e1-8d7e0f6652a0'; // testuser ID
const roomId = '5b27b0c8-8bea-4a8d-8f86-5b4d6e8f9a7b'; // test room ID

// Insert test stream
const insertQuery = `
  INSERT INTO stream (id, title, description, status, type, viewerCount, streamKey, streamerId, roomId, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

const now = new Date().toISOString();

db.run(insertQuery, [
  streamId,
  'Test RTMP Stream',
  'Test stream for RTMP authentication',
  'active',  // StreamStatus.ACTIVE
  'rtmp',    // StreamType.RTMP
  0,
  streamKey,
  userId,
  roomId,
  now,
  now
], function(err) {
  if (err) {
    console.error('Error inserting test stream:', err);
  } else {
    console.log('Test stream created successfully!');
    console.log('Stream ID:', streamId);
    console.log('Stream Key:', streamKey);
    console.log('RTMP URL: rtmp://localhost:1935/live/' + streamKey);
  }
  
  db.close();
});
