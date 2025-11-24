// ĐỪNG AI HỎI TẠI SAO FILE NÀY CÓ TRONG ASSETS. LOL :)))
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const webp = require('webp-converter');

const directory = __dirname;

fs.readdir(directory, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  files.forEach(file => {
    if (path.extname(file).toLowerCase() === '.gif') {
      const inputPath = path.join(directory, file);
      const outputPath = path.join(directory, path.basename(file, '.gif') + '.webp');

      webp.gwebp(inputPath, outputPath, "-q 80 -mt -lossy")
        .then(() => {
          console.log(`Converted ${file} to ${path.basename(outputPath)}`);
        })
        .catch(err => {
          console.error(`Error converting ${file}:`, err);
        });
    }
  });
});