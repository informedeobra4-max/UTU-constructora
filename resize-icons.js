import * as Jimp from 'jimp';
import path from 'path';

async function generateIcons() {
  try {
    const imgPath = path.resolve('src/assets/logo.jpeg');
    const img = await Jimp.read(imgPath);
    
    // Generar iconos PNG
    await img.clone().resize(192, 192).writeAsync('public/pwa-192x192.png');
    await img.clone().resize(512, 512).writeAsync('public/pwa-512x512.png');
    await img.clone().resize(180, 180).writeAsync('public/apple-touch-icon.png');
    // Para el favicon estándar
    await img.clone().resize(64, 64).writeAsync('public/favicon.png');
    
    console.log('Icons generated successfully');
  } catch (err) {
    console.error('Error generating icons:', err);
  }
}

generateIcons();
