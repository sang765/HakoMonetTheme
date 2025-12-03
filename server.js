/**
 * HakoMonetTheme Local Development Server
 * Provides auto-reload functionality for Userscript development
 * Features: Static file serving, WebSocket auto-reload, file watching
 */

const express = require('express');
const chokidar = require('chokidar');
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

// Log static file requests
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  if (req.url.match(/\.(css|js|scss|map)$/)) {
    console.log(`[REQUEST] ${timestamp} - ${req.method} ${req.url}`);
  }
  next();
});

// Serve project files from root (for Userscript) with no-cache for CSS/JS
app.use(express.static(CONFIG.WATCH_PATH, {
  setHeaders: (res, path) => {
    if (path.endsWith('.css') || path.endsWith('.js') || path.endsWith('.scss') || path.endsWith('.map')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      console.log(`[CACHE] Disabled cache for: ${path}`);
    } else {
      console.log(`[CACHE] Default cache for: ${path}`);
    }
  }
}));

// Serve dashboard from web folder at /dashboard
app.use('/dashboard', express.static(path.join(__dirname, 'web')));

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
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🚀 HakoMonetTheme Dev Server</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                color: #333;
                overflow-x: hidden;
            }

            .container {
                max-width: 800px;
                margin: 0 auto;
                padding: 40px 20px;
                text-align: center;
            }

            .hero {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                padding: 60px 40px;
                margin-bottom: 30px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                position: relative;
                overflow: hidden;
            }

            .hero::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: linear-gradient(45deg, transparent 30%, rgba(102, 126, 234, 0.1) 50%, transparent 70%);
                animation: shimmer 3s infinite;
            }

            @keyframes shimmer {
                0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
                100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
            }

            .logo {
                font-size: 4rem;
                margin-bottom: 20px;
                animation: bounce 2s infinite;
            }

            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                40% { transform: translateY(-10px); }
                60% { transform: translateY(-5px); }
            }

            h1 {
                font-size: 2.5rem;
                background: linear-gradient(135deg, #667eea, #764ba2);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 10px;
            }

            .subtitle {
                color: #666;
                font-size: 1.2rem;
                margin-bottom: 30px;
            }

            .status-card {
                display: inline-block;
                background: linear-gradient(135deg, #28a745, #20c997);
                color: white;
                padding: 15px 30px;
                border-radius: 50px;
                font-weight: 600;
                font-size: 1.1rem;
                box-shadow: 0 8px 20px rgba(40, 167, 69, 0.3);
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0% { box-shadow: 0 8px 20px rgba(40, 167, 69, 0.3); }
                50% { box-shadow: 0 8px 30px rgba(40, 167, 69, 0.5); }
                100% { box-shadow: 0 8px 20px rgba(40, 167, 69, 0.3); }
            }

            .features-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin: 40px 0;
            }

            .feature-card {
                background: rgba(255, 255, 255, 0.9);
                backdrop-filter: blur(10px);
                padding: 30px 20px;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }

            .feature-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
            }

            .feature-icon {
                font-size: 2.5rem;
                margin-bottom: 15px;
            }

            .feature-card h3 {
                color: #333;
                margin-bottom: 10px;
                font-size: 1.3rem;
            }

            .feature-card p {
                color: #666;
                line-height: 1.6;
            }

            .stats {
                display: flex;
                justify-content: center;
                gap: 40px;
                margin: 40px 0;
                flex-wrap: wrap;
            }

            .stat-item {
                text-align: center;
                background: rgba(255, 255, 255, 0.9);
                padding: 20px;
                border-radius: 15px;
                min-width: 120px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            }

            .stat-number {
                font-size: 2rem;
                font-weight: bold;
                color: #667eea;
                display: block;
            }

            .stat-label {
                color: #666;
                font-size: 0.9rem;
                margin-top: 5px;
            }

            .actions {
                display: flex;
                gap: 20px;
                justify-content: center;
                flex-wrap: wrap;
                margin: 40px 0;
            }

            .btn {
                display: inline-flex;
                align-items: center;
                gap: 10px;
                padding: 15px 30px;
                border: none;
                border-radius: 50px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                text-decoration: none;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            }

            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
            }

            .btn-primary {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
            }

            .btn-secondary {
                background: rgba(255, 255, 255, 0.9);
                color: #333;
                border: 2px solid #667eea;
            }

            .footer {
                margin-top: 60px;
                padding: 20px;
                color: rgba(255, 255, 255, 0.8);
                font-size: 0.9rem;
            }

            @media (max-width: 768px) {
                .container {
                    padding: 20px 15px;
                }

                .hero {
                    padding: 40px 20px;
                }

                h1 {
                    font-size: 2rem;
                }

                .features-grid {
                    grid-template-columns: 1fr;
                }

                .stats {
                    gap: 20px;
                }

                .actions {
                    flex-direction: column;
                    align-items: center;
                }

                .btn {
                    width: 100%;
                    max-width: 300px;
                    justify-content: center;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="hero">
                <div class="logo">🎨</div>
                <h1>HakoMonetTheme</h1>
                <p class="subtitle">Development Server</p>
                <div class="status-card">
                    ✅ Server Online - Port ${CONFIG.PORT}
                </div>
            </div>

            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">🔄</div>
                    <h3>Auto-Reload</h3>
                    <p>Tự động làm mới trình duyệt khi lưu file. Không cần refresh thủ công nữa!</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🌐</div>
                    <h3>WebSocket</h3>
                    <p>Kết nối real-time để cập nhật tức thời giữa server và client.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📁</div>
                    <h3>File Watching</h3>
                    <p>Theo dõi thay đổi của tất cả file trong dự án một cách tự động.</p>
                </div>
            </div>

            <div class="stats">
                <div class="stat-item">
                    <span class="stat-number" id="clients">0</span>
                    <div class="stat-label">Clients</div>
                </div>
                <div class="stat-item">
                    <span class="stat-number" id="files">0</span>
                    <div class="stat-label">Files</div>
                </div>
                <div class="stat-item">
                    <span class="stat-number" id="uptime">0s</span>
                    <div class="stat-label">Uptime</div>
                </div>
            </div>

            <div class="actions">
                <a href="/dashboard" class="btn btn-primary">
                    📊 Dashboard
                </a>
                <a href="/status" class="btn btn-secondary">
                    📋 API Status
                </a>
                <a href="https://github.com/sang765/HakoMonetTheme" target="_blank" class="btn btn-secondary">
                    📖 Documentation
                </a>
            </div>
        </div>

        <div class="footer">
            <p>🚀 Powered by Node.js | Made with ❤️ for developers</p>
        </div>

        <script>
            // Update stats in real-time
            async function updateStats() {
                try {
                    const response = await fetch('/status');
                    const data = await response.json();

                    document.getElementById('clients').textContent = data.clients;
                    document.getElementById('uptime').textContent = formatUptime(data.uptime);
                } catch (error) {
                    console.error('Failed to fetch stats:', error);
                }
            }

            function formatUptime(seconds) {
                const hours = Math.floor(seconds / 3600);
                const minutes = Math.floor((seconds % 3600) / 60);
                const secs = Math.floor(seconds % 60);

                if (hours > 0) return \`\${hours}h\`;
                if (minutes > 0) return \`\${minutes}m\`;
                return \`\${secs}s\`;
            }

            // Update stats every 5 seconds
            updateStats();
            setInterval(updateStats, 5000);

            // WebSocket connection for real-time updates
            const ws = new WebSocket('ws://localhost:${CONFIG.PORT}');
            ws.onopen = () => console.log('Connected to dev server');
            ws.onmessage = (event) => {
                if (event.data === 'reload') {
                    // Could show a notification here
                    console.log('Reload signal received');
                }
            };
            ws.onerror = (error) => console.error('WebSocket error:', error);
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
    watching: watcher ? 'active' : 'inactive',
    timestamp: new Date().toISOString()
  });
});

app.get('/config', (req, res) => {
  // Detect if running in Github Codespaces
  const isCodespaces = !!(process.env.CODESPACE_NAME && process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN);
  let baseUrl;

  if (isCodespaces) {
    const codespaceName = process.env.CODESPACE_NAME;
    const domain = process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN;
    baseUrl = `https://${codespaceName}-${CONFIG.PORT}.${domain}`;
  } else {
    baseUrl = `http://${CONFIG.HOST}:${CONFIG.PORT}`;
  }

  res.json({
    baseUrl: baseUrl,
    isCodespaces: isCodespaces,
    port: CONFIG.PORT,
    host: CONFIG.HOST
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
    console.log(`🌐 HTTP server: http://${CONFIG.HOST}:${CONFIG.PORT}`);
    console.log(`📊 Dashboard: http://${CONFIG.HOST}:${CONFIG.PORT}/dashboard`);
    console.log(` Auto-reload: Enabled (polling)`);
    console.log(`📁 Watching: ${path.resolve(CONFIG.WATCH_PATH)}`);
    console.log(`📊 Status API: http://${CONFIG.HOST}:${CONFIG.PORT}/status`);
    console.log('='.repeat(50));
    console.log('💡 Press Ctrl+C to stop the server');
    console.log('');
  });
} catch (error) {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
}

// WebSocket server removed - using polling auto-reload instead

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
    const timestamp = new Date().toISOString();
    console.log(`📝 File changed: ${relativePath} at ${timestamp}`);
    // File watching active for polling auto-reload
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

// WebSocket removed - using polling auto-reload instead

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