const fs = require('fs');

function removeBom(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath);
    if (content[0] === 0xEF && content[1] === 0xBB && content[2] === 0xBF) {
        content = content.slice(3);
        fs.writeFileSync(filePath, content);
        console.log(`Removed BOM from ${filePath}`);
    } else {
        console.log(`No BOM found in ${filePath}`);
    }
}

removeBom('package.json');
removeBom('vite.config.ts');

const tomlContent = `[build]\n  command = "npm run build"\n  publish = "dist"\n\n[[redirects]]\n  from = "/*"\n  to = "/index.html"\n  status = 200\n`;
fs.writeFileSync('netlify.toml', Buffer.from(tomlContent, 'utf8'));
console.log('Created netlify.toml without BOM');
