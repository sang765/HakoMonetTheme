const { exec } = require('child_process');
const { platform } = require('os');
const path = require('path');
const fs = require('fs');

// Detect environment
const isCodespaces = !!process.env.CODESPACE_NAME;
const isWindows = platform() === 'win32';
const isMac = platform() === 'darwin';
const isLinux = platform() === 'linux';

// Construct URL
let installUrl;
if (isCodespaces) {
    const codespaceName = process.env.CODESPACE_NAME;
    const forwardingDomain = process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN;
    if (!codespaceName || !forwardingDomain) {
        console.error('GitHub Codespaces detected but required environment variables are missing.');
        console.error('Please ensure CODESPACE_NAME and GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN are set.');
        process.exit(1);
    }
    installUrl = `https://${codespaceName}-8080.${forwardingDomain}/HakoMonetTheme.user.js`;
} else {
    installUrl = 'http://localhost:8080/HakoMonetTheme.user.js';
}

// Check and install dependencies if needed
const packageJsonPath = path.join(__dirname, 'package.json');
const nodeModulesPath = path.join(__dirname, 'node_modules');

if (fs.existsSync(packageJsonPath) && !fs.existsSync(nodeModulesPath)) {
    console.log('Installing dependencies...');
    exec('npm install', (error, stdout, stderr) => {
        if (error) {
            console.error('Failed to install dependencies:', error);
            console.error(stderr);
            console.log('Please run "npm install" manually.');
            return;
        }
        console.log('Dependencies installed successfully.');
        proceedToOpen();
    });
} else {
    proceedToOpen();
}

function proceedToOpen() {
    console.log('Opening HakoMonetTheme install link...');
    console.log(`URL: ${installUrl}`);

    // Determine open command based on platform
    let openCommand;
    if (isWindows) {
        openCommand = 'start';
    } else if (isMac) {
        openCommand = 'open';
    } else {
        openCommand = 'xdg-open';
    }

    exec(`${openCommand} "${installUrl}"`, (error, stdout, stderr) => {
        if (error) {
            console.error('Failed to open browser:', error);
            console.error(stderr);
            console.log('Please manually open:', installUrl);
            if (isCodespaces) {
                console.log('In GitHub Codespaces, ensure port 8080 is forwarded and try opening the URL in a new browser tab.');
            }
        } else {
            console.log('Browser opened successfully!');
        }
    });
}