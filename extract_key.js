import fs from 'fs';
const content = fs.readFileSync('dist/assets/index-DQpGN_sh.js', 'utf8');
const index = content.indexOf('eyJhbGciOiJIUzI1Ni');
if (index !== -1) {
  console.log("Found at index:", index);
  console.log("Context:", content.substring(index - 50, index + 300));
} else {
  console.log("Not found");
}
