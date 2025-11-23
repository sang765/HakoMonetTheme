/**
 * HakoMonetTheme Development Dashboard JavaScript
 */

class DashboardApp {
    constructor() {
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.reloadCount = 0;
        this.recentChanges = [];
        this.maxRecentChanges = 10;

        this.init();
    }

    init() {
        this.setupWebSocket();
        this.setupTabs();
        this.setupEventListeners();
        this.loadInitialData();
        this.startStatusUpdates();
    }

    setupWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}`;

        try {
            this.ws = new WebSocket(wsUrl);
            this.updateStatus('ws-status', 'connecting', '🔄 Connecting...');

            this.ws.onopen = () => {
                this.updateStatus('ws-status', 'online', '🟢 Connected');
                this.reconnectAttempts = 0;
                this.log('WebSocket connected', 'success');
            };

            this.ws.onmessage = (event) => {
                this.handleWebSocketMessage(event.data);
            };

            this.ws.onclose = () => {
                this.updateStatus('ws-status', 'offline', '🔴 Disconnected');
                this.log('WebSocket disconnected', 'warning');
                this.attemptReconnect();
            };

            this.ws.onerror = (error) => {
                this.log(`WebSocket error: ${error}`, 'error');
            };
        } catch (error) {
            this.log(`Failed to create WebSocket: ${error}`, 'error');
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            this.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`, 'info');

            setTimeout(() => {
                this.setupWebSocket();
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            this.log('Max reconnection attempts reached', 'error');
        }
    }

    handleWebSocketMessage(data) {
        if (data === 'reload') {
            this.reloadCount++;
            document.getElementById('reload-count').textContent = this.reloadCount;
            this.log('Page reload triggered', 'info');
        }
    }

    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                // Add active class to clicked button and corresponding content
                button.classList.add('active');
                const tabId = button.dataset.tab;
                document.getElementById(tabId).classList.add('active');
            });
        });
    }

    setupEventListeners() {
        // Force reload button
        document.getElementById('force-reload').addEventListener('click', () => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send('force-reload');
                this.log('Force reload requested', 'info');
            } else {
                this.log('WebSocket not connected', 'error');
            }
        });

        // Clear cache button
        document.getElementById('clear-cache').addEventListener('click', () => {
            if (confirm('Clear browser cache? This will refresh the page.')) {
                window.location.reload(true);
            }
        });

        // Restart server button
        document.getElementById('restart-server').addEventListener('click', () => {
            if (confirm('Restart development server? This will temporarily disconnect all clients.')) {
                // This would require server-side support
                this.log('Server restart not implemented in client', 'warning');
            }
        });

        // File search
        document.getElementById('file-search').addEventListener('input', (e) => {
            this.filterFiles(e.target.value);
        });

        // Clear logs
        document.getElementById('clear-logs').addEventListener('click', () => {
            document.getElementById('logs-container').innerHTML = '';
            this.log('Logs cleared', 'info');
        });

        // Toggle debug
        document.getElementById('toggle-debug').addEventListener('click', () => {
            // This would toggle debug mode on server
            this.log('Debug mode toggle not implemented', 'warning');
        });

        // Export config
        document.getElementById('export-config').addEventListener('click', () => {
            this.exportConfig();
        });
    }

    async loadInitialData() {
        try {
            // Load server status
            const statusResponse = await fetch('/status');
            const statusData = await statusResponse.json();
            this.updateServerStatus(statusData);

            // Load files
            const filesResponse = await fetch('/files');
            const filesData = await filesResponse.json();
            this.updateFilesList(filesData.files);

        } catch (error) {
            this.log(`Failed to load initial data: ${error}`, 'error');
        }
    }

    updateServerStatus(data) {
        document.getElementById('uptime').textContent = this.formatUptime(data.uptime);
        document.getElementById('clients').textContent = data.clients;
        document.getElementById('config-port').textContent = data.port;
        document.getElementById('config-host').textContent = data.host;

        if (data.status === 'online') {
            this.updateStatus('server-status', 'online', '🟢 Online');
        } else {
            this.updateStatus('server-status', 'offline', '🔴 Offline');
        }
    }

    updateFilesList(files) {
        const filesList = document.getElementById('files-list');
        const fileCount = document.getElementById('file-count');

        fileCount.textContent = files.length;

        if (files.length === 0) {
            filesList.innerHTML = '<p>No files found</p>';
            return;
        }

        const fileItems = files.slice(0, 100).map(file => {
            const icon = this.getFileIcon(file);
            const size = this.getFileSize(file);
            return `
                <div class="file-item" data-file="${file}">
                    <span class="file-icon">${icon}</span>
                    <span class="file-name">${file}</span>
                    <span class="file-size">${size}</span>
                </div>
            `;
        }).join('');

        filesList.innerHTML = fileItems;

        // Add click handlers for file items
        document.querySelectorAll('.file-item').forEach(item => {
            item.addEventListener('click', () => {
                const fileName = item.dataset.file;
                this.log(`Viewing file: ${fileName}`, 'info');
                // Could open file in new tab or show preview
            });
        });
    }

    filterFiles(searchTerm) {
        const fileItems = document.querySelectorAll('.file-item');
        const term = searchTerm.toLowerCase();

        fileItems.forEach(item => {
            const fileName = item.dataset.file.toLowerCase();
            if (fileName.includes(term)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    startStatusUpdates() {
        // Update status every 30 seconds
        setInterval(async () => {
            try {
                const response = await fetch('/status');
                const data = await response.json();
                this.updateServerStatus(data);
            } catch (error) {
                this.log(`Status update failed: ${error}`, 'error');
            }
        }, 30000);
    }

    updateStatus(elementId, statusClass, text) {
        const element = document.getElementById(elementId);
        element.className = `status ${statusClass}`;
        element.textContent = text;
    }

    formatUptime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }

    getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();

        const icons = {
            js: '📄',
            css: '🎨',
            html: '🌐',
            json: '📋',
            md: '📝',
            jpg: '🖼️',
            png: '🖼️',
            gif: '🖼️',
            svg: '🎯',
            default: '📄'
        };

        return icons[ext] || icons.default;
    }

    getFileSize(filename) {
        // This is a simplified version - in a real app you'd get actual file sizes
        // For now, just return a placeholder
        return '~1KB';
    }

    addRecentChange(type, file) {
        const change = {
            time: new Date().toLocaleTimeString(),
            type: type,
            file: file
        };

        this.recentChanges.unshift(change);
        if (this.recentChanges.length > this.maxRecentChanges) {
            this.recentChanges.pop();
        }

        this.updateRecentChanges();
    }

    updateRecentChanges() {
        const container = document.getElementById('recent-changes-list');

        if (this.recentChanges.length === 0) {
            container.innerHTML = '<p class="no-changes">No recent changes</p>';
            return;
        }

        const changesHtml = this.recentChanges.map(change => `
            <div class="change-item">
                <span class="change-time">${change.time}</span>
                <span class="change-type ${change.type}">${change.type.toUpperCase()}</span>
                <span class="change-file">${change.file}</span>
            </div>
        `).join('');

        container.innerHTML = changesHtml;
    }

    exportConfig() {
        const config = {
            server: {
                port: document.getElementById('config-port').textContent,
                host: document.getElementById('config-host').textContent,
                watchPath: document.getElementById('config-watch-path').textContent
            },
            exportedAt: new Date().toISOString(),
            userAgent: navigator.userAgent
        };

        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'hmt-config.json';
        a.click();
        URL.revokeObjectURL(url);

        this.log('Configuration exported', 'success');
    }

    log(message, level = 'info') {
        const logsContainer = document.getElementById('logs-container');
        const now = new Date();
        const timeString = now.toLocaleTimeString();

        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.innerHTML = `
            <span class="log-time">${timeString}</span>
            <span class="log-level ${level}">${level.toUpperCase()}</span>
            <span class="log-message">${message}</span>
        `;

        logsContainer.appendChild(logEntry);
        logsContainer.scrollTop = logsContainer.scrollHeight;

        // Keep only last 100 log entries
        while (logsContainer.children.length > 100) {
            logsContainer.removeChild(logsContainer.firstChild);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardApp = new DashboardApp();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.dashboardApp) {
        // Refresh data when page becomes visible
        window.dashboardApp.loadInitialData();
    }
});