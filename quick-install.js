const { exec } = require('child_process');
const installUrl = 'http://localhost:5500/HakoMonetTheme.user.js';

console.log('Opening HakoMonetTheme install link...');
console.log(`URL: ${installUrl}`);

exec(`start ${installUrl}`, (error) => {
    if (error) {
        console.error('Failed to open browser:', error);
        console.log('Please manually open:', installUrl);
    } else {
        console.log('Browser opened successfully!');
    }
});