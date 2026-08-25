const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'components');
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));

let changedFiles = 0;

for (const file of files) {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find back buttons containing <ArrowLeft
  // We look for onClick={() => navigate('something')}...<ArrowLeft
  const regex = /onClick=\{\(\)\s*=>\s*navigate\(['"][^'"]+['"]\)\}([^>]*>)(\s*)<ArrowLeft/g;
  
  if (regex.test(content)) {
    content = content.replace(regex, 'onClick={() => navigate(\'back\')}$1$2<ArrowLeft');
    fs.writeFileSync(filePath, content);
    changedFiles++;
    console.log(`Updated ${file}`);
  }
}

console.log(`Done. Updated ${changedFiles} files.`);
