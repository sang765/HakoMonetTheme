/**
 * HakoMonetTheme Local Development Server
 * Provides auto-reload functionality for Userscript development
 * Features: Static file serving, WebSocket auto-reload, file watching
 */

const express = require('express');
const chokidar = require('chokidar');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

// Configuration
const CONFIG = {
  PORT: process.env.PORT || 8080,
  HOST: process.env.HOST || 'localhost',
  WATCH_PATH: process.env.WATCH_PATH || '.',
  IGNORED_PATTERNS: [
    /(^|[\/\\])\../, // Dotfiles
    'node_modules/**',
    '*.log',
    'server.js', // Avoid self-triggering
    '.git/**',
    'dist/**',
    'build/**'
  ]
};

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.static(CONFIG.WATCH_PATH));

// Add CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Routes
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>HakoMonetTheme Dev Server</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
        .online { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
      </style>
    </head>
    <body>
      <h1>HakoMonetTheme Development Server</h1>
      <div class="status online">✅ Server Online - Port ${CONFIG.PORT}</div>
      <div class="info">
        <h3>Features:</h3>
        <ul>
          <li>Auto-reload on file changes</li>
          <li>WebSocket connection for live updates</li>
          <li>Static file serving</li>
        </ul>
        <h3>Connected Clients: <span id="clients">0</span></h3>
        <h3>Files Being Watched: <span id="files">0</span></h3>
      </div>
      <script>
        const ws = new WebSocket('ws://localhost:${CONFIG.PORT}');
        ws.onopen = () => console.log('Connected to server');
        ws.onmessage = (event) => {
          if (event.data === 'reload') {
            console.log('Reload signal received');
          }
        };
      </script>
    </body>
    </html>
  `);
});

app.get('/status', (req, res) => {
  res.json({
    status: 'online',
    port: CONFIG.PORT,
    uptime: process.uptime(),
    clients: wss ? wss.clients.size : 0,
    watching: watcher ? 'active' : 'inactive',
    timestamp: new Date().toISOString()
  });
});

app.get('/files', (req, res) => {
  const walk = (dir, files = []) => {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory() && !CONFIG.IGNORED_PATTERNS.some(pattern => pattern.test(fullPath))) {
        walk(fullPath, files);
      } else if (stat.isFile() && !CONFIG.IGNORED_PATTERNS.some(pattern => pattern.test(fullPath))) {
        files.push(fullPath);
      }
    }
    return files;
  };

  try {
    const files = walk(CONFIG.WATCH_PATH);
    res.json({ files: files.length, list: files.slice(0, 100) }); // Limit for performance
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Create HTTP server
let server;
try {
  server = app.listen(CONFIG.PORT, CONFIG.HOST, () => {
    console.log('='.repeat(50));
    console.log('🚀 HakoMonetTheme Development Server');
    console.log('='.repeat(50));
    console.log(`📡 Server: http://${CONFIG.HOST}:${CONFIG.PORT}`);
    console.log(`🔄 Auto-reload: Enabled`);
    console.log(`📁 Watching: ${path.resolve(CONFIG.WATCH_PATH)}`);
    console.log(`🌐 WebSocket: ws://${CONFIG.HOST}:${CONFIG.PORT}`);
    console.log(`📊 Status: http://${CONFIG.HOST}:${CONFIG.PORT}/status`);
    console.log('='.repeat(50));
    console.log('💡 Press Ctrl+C to stop the server');
    console.log('');
  });
} catch (error) {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
}

// WebSocket server
let wss;
try {
  wss = new WebSocket.Server({ server });
  console.log('🔌 WebSocket server initialized');
} catch (error) {
  console.error('❌ Failed to initialize WebSocket server:', error.message);
}

// File watcher
let watcher;
try {
  watcher = chokidar.watch(CONFIG.WATCH_PATH, {
    ignored: CONFIG.IGNORED_PATTERNS,
    persistent: true,
    ignoreInitial: true, // Don't trigger on startup
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 50
    }
  });

  watcher.on('ready', () => {
    console.log(`👀 Watching ${watcher.getWatched().length} directories`);
  });

  watcher.on('change', (filePath) => {
    const relativePath = path.relative(CONFIG.WATCH_PATH, filePath);
    console.log(`📝 File changed: ${relativePath}`);
    broadcast('reload');
  });

  watcher.on('add', (filePath) => {
    const relativePath = path.relative(CONFIG.WATCH_PATH, filePath);
    console.log(`➕ File added: ${relativePath}`);
  });

  watcher.on('unlink', (filePath) => {
    const relativePath = path.relative(CONFIG.WATCH_PATH, filePath);
    console.log(`➖ File removed: ${relativePath}`);
  });

  watcher.on('error', (error) => {
    console.error('❌ Watcher error:', error);
  });

} catch (error) {
  console.error('❌ Failed to initialize file watcher:', error.message);
}

// WebSocket connection handling
if (wss) {
  wss.on('connection', (ws, req) => {
    const clientIP = req.socket.remoteAddress;
    console.log(`🔗 Client connected: ${clientIP} (${wss.clients.size} total)`);

    ws.on('message', (message) => {
      console.log(`💬 Message from ${clientIP}:`, message.toString());
    });

    ws.on('close', () => {
      console.log(`🔌 Client disconnected: ${clientIP} (${wss.clients.size - 1} remaining)`);
    });

    ws.on('error', (error) => {
      console.error(`❌ WebSocket error from ${clientIP}:`, error);
    });
  });
}

// Broadcast function
function broadcast(message) {
  if (!wss) return;
  let sent = 0;
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
      sent++;
    }
  });
  if (sent > 0) {
    console.log(`📡 Broadcasted "${message}" to ${sent} clients`);
  }
}

// Graceful shutdown
function shutdown(signal) {
  console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);

  const promises = [];

  if (watcher) {
    promises.push(new Promise((resolve) => {
      watcher.close();
      console.log('👀 File watcher stopped');
      resolve();
    }));
  }

  if (wss) {
    promises.push(new Promise((resolve) => {
      wss.clients.forEach(client => client.close());
      wss.close(() => {
        console.log('🔌 WebSocket server stopped');
        resolve();
      });
    }));
  }

  if (server) {
    promises.push(new Promise((resolve) => {
      server.close(() => {
        console.log('🌐 HTTP server stopped');
        resolve();
      });
    }));
  }

  Promise.all(promises).then(() => {
    console.log('✅ Server shutdown complete');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  shutdown('unhandledRejection');
});

console.log('🔄 Starting file watcher...');