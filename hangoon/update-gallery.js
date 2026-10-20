const fs = require('node:fs');
const path = require('node:path');

const imagesDirectory = path.join(__dirname, 'images');
const manifestPath = path.join(imagesDirectory, 'gallery.json');
const extensions = ['.png', '.jpg', '.jpeg'];
const files = fs.readdirSync(imagesDirectory)
  .filter((file) => /^\d+\.(png|jpe?g)$/i.test(file))
  .sort((left, right) => {
    const leftNumber = Number.parseInt(left, 10);
    const rightNumber = Number.parseInt(right, 10);
    if (leftNumber !== rightNumber) return leftNumber - rightNumber;
    return extensions.indexOf(path.extname(left).toLowerCase()) - extensions.indexOf(path.extname(right).toLowerCase());
  });

const oldManifest = fs.existsSync(manifestPath)
  ? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  : {};
const descriptions = oldManifest.descriptions && typeof oldManifest.descriptions === 'object'
  ? oldManifest.descriptions
  : {};
const images = [];
const seenNumbers = new Set();

for (const filename of files) {
  const number = Number.parseInt(filename, 10);
  if (seenNumbers.has(number)) {
    console.warn(`Skipping duplicate numbered image: ${filename}`);
    continue;
  }
  seenNumbers.add(number);
  images.push(filename);
  if (!descriptions[filename]) {
    descriptions[filename] = {
      en: `Artwork ${number} — add a description here.`,
      fr: `Illustration ${number} — ajoute une description ici.`,
    };
  }
}

fs.writeFileSync(manifestPath, `${JSON.stringify({ images, descriptions }, null, 2)}\n`);
console.log(`Updated ${manifestPath} with ${images.length} numbered images.`);
