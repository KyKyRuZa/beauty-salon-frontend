import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';

const assetsDir = './src/assets';
const quality = 80;

async function convertToWebP() {
  try {
    const files = await readdir(assetsDir);
    const pngFiles = files.filter(f => f.endsWith('.png'));

    console.log(`Найдено ${pngFiles.length} PNG файлов для конвертации`);

    for (const file of pngFiles) {
      const inputPath = join(assetsDir, file);
      const outputPath = inputPath.replace('.png', '.webp');
      
      const stats = await stat(inputPath);
      const oldSize = stats.size;

      await sharp(inputPath)
        .webp({ quality })
        .toFile(outputPath);

      const newStats = await stat(outputPath);
      const newSize = newStats.size;
      const savings = ((1 - newSize / oldSize) * 100).toFixed(1);

      console.log(`✓ ${file} → ${file.replace('.png', '.webp')} (${(oldSize/1024).toFixed(0)}KB → ${(newSize/1024).toFixed(0)}KB, экономия ${savings}%)`);
    }

    console.log('\n✅ Конвертация завершена!');
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

convertToWebP();
