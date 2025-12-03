const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8080;
const LOG_DIR = 'logs';
const MAX_LOG_FILES = 10;

// Function to set CORS headers
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// Function to serve static files
function serveStaticFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
      return;
    }
    // Set content type based on extension
    const ext = path.extname(filePath);
    const contentType = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.ico': 'image/x-icon'
    }[ext] || 'text/plain';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

// Function to handle log
function handleLog(res, body) {
  try {
    const logData = JSON.parse(body);
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5); // YYYY-MM-DDTHH-MM-SS
    const filename = `log_${timestamp}.txt`;
    const logPath = path.join(LOG_DIR, filename);

    // Ensure logs dir exists
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }

    // Write log
    const logContent = `${now.toISOString()}\n${JSON.stringify(logData, null, 2)}\n\n`;
    fs.appendFileSync(logPath, logContent);

    // Manage log files
    manageLogFiles();

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Log received');
  } catch (error) {
    console.error('Error handling log:', error);
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Invalid log data');
  }
}

// Function to manage log files
function manageLogFiles() {
  try {
    if (!fs.existsSync(LOG_DIR)) return;
    const files = fs.readdirSync(LOG_DIR)
      .filter(file => file.startsWith('log_') && file.endsWith('.txt'))
      .map(file => {
        const filePath = path.join(LOG_DIR, file);
        return {
          path: filePath,
          mtime: fs.statSync(filePath).mtime
        };
      })
      .sort((a, b) => b.mtime - a.mtime);

    if (files.length > MAX_LOG_FILES) {
      for (let i = MAX_LOG_FILES; i < files.length; i++) {
        fs.unlinkSync(files[i].path);
      }
    }
  } catch (error) {
    console.error('Error managing log files:', error);
  }
}

const server = http.createServer((req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  if (req.method === 'POST' && pathname === '/log') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => handleLog(res, body));
    return;
  }

  if (req.method === 'GET') {
    let filePath;
    if (pathname === '/') {
      filePath = path.join(__dirname, 'index.html');
    } else {
      filePath = path.join(__dirname, pathname);
    }
    serveStaticFile(res, filePath);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Serving files from web/ directory`);
  console.log(`Log endpoint: POST /log`);
  console.log(`Logs stored in ${LOG_DIR}/ with max ${MAX_LOG_FILES} files`);
});