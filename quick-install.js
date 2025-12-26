const { exec } = require('child_process');
const baseUrl = process.env.HMT_BASE_URL || 'http://localhost:5500';
const installUrl = `${baseUrl}/HakoMonetTheme.user.js`;

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