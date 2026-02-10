const fs = require('fs');
try {
    const content = fs.readFileSync('ip.json', 'utf16le');
    fs.writeFileSync('ip_fixed.txt', content, 'utf8');
    console.log('Conversion successful');
} catch (err) {
    console.error(err);
}
