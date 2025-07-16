const net = require('net');

// Create a simple RTMP handshake simulation
const client = new net.Socket();

client.connect(1935, 'localhost', function() {
    console.log('Connected to RTMP server');
    
    // Send basic RTMP handshake
    const handshake = Buffer.alloc(1537);
    handshake[0] = 0x03; // RTMP version
    
    client.write(handshake);
});

client.on('data', function(data) {
    console.log('Received data from server:', data.length, 'bytes');
    client.destroy();
});

client.on('close', function() {
    console.log('Connection closed');
});

client.on('error', function(err) {
    console.log('Connection error:', err.message);
});
