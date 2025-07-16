const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('streaming.db');

// Test query to check if our stream key exists
db.get('SELECT * FROM stream WHERE streamKey = ?', ['test12345'], (err, row) => {
  if (err) {
    console.error('Error querying database:', err);
  } else if (row) {
    console.log('Stream found in database:');
    console.log('ID:', row.id);
    console.log('Title:', row.title);
    console.log('Status:', row.status);
    console.log('Type:', row.type);
    console.log('Stream Key:', row.streamKey);
  } else {
    console.log('No stream found with key: test12345');
  }
  
  db.close();
});
