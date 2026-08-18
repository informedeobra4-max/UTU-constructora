const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function resizeIcons() {
  const inputPath = path.resolve('src/assets/logo.jpeg');
  if (!fs.existsSync(inputPath)) {
    console.error('File not found:', inputPath);
    return;
  }

  try {
    const img = sharp(inputPath);

    await img.resize(192, 192).png().toFile('public/pwa-192x192.png');
    console.log('Created pwa-192x192.png');

    await img.resize(512, 512).png().toFile('public/pwa-512x512.png');
    console.log('Created pwa-512x512.png');

    await img.resize(180, 180).png().toFile('public/apple-touch-icon.png');
    console.log('Created apple-touch-icon.png');

    await img.resize(64, 64).png().toFile('public/favicon.png');
    console.log('Created favicon.png');

  } catch (err) {
    console.error('Error generating icons:', err);
  }
}

resizeIcons();
