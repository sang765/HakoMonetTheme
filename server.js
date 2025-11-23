const express = require('express');
const chokidar = require('chokidar');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const PORT = 8080;

// Serve static files from current directory
app.use(express.static('.'));

// Create HTTP server
const server = app.listen(PORT, () => {
  console.log(`Development server running on http://localhost:${PORT}`);
  console.log('Auto-reload enabled. Save files to trigger browser refresh.');
});

// WebSocket server
const wss = new WebSocket.Server({ server });

// File watcher
const watcher = chokidar.watch('.', {
  ignored: [
    /(^|[\/\\])\../, // Ignore dotfiles
    'node_modules/**',
    '*.log',
    'server.js' // Ignore this file to avoid loops
  ],
  persistent: true
});

watcher.on('change', (filePath) => {
  console.log(`File changed: ${filePath}`);
  // Send reload message to all connected clients
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send('reload');
    }
  });
});

watcher.on('add', (filePath) => {
  console.log(`File added: ${filePath}`);
});

watcher.on('unlink', (filePath) => {
  console.log(`File removed: ${filePath}`);
});

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('Client connected for auto-reload');
  ws.on('message', (message) => {
    console.log('Received:', message);
  });
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  watcher.close();
  server.close(() => {
    console.log('Server stopped.');
    process.exit(0);
  });
});