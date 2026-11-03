// Generate multiple PNG sizes for each icon — one folder per icon.
//
//   png/affinity.png  ->  png/affinity/512px.png
//                         png/affinity/256px.png
//                         png/affinity/128px.png
//
// Each icon's sizes live in a folder beside the original. Full resolution
// stays at png/<name>.png (no 1024 variant, to avoid duplicating the
// original). The flat source PNGs are never modified. Never upscales: a
// target larger than the source is skipped.
//
// Usage:
//   npm install
//   npm run sizes        (or: node scripts/generate-sizes.js)

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const SRC_DIR = "png"; // flat source PNGs (unchanged)
const OUT_DIR = "png"; // per-icon folders of sized PNGs live beside the originals
const SIZES = [512, 256, 128]; // longest-edge targets, px (full-res stays in png/)

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const pngs = fs
    .readdirSync(SRC_DIR)
    .filter((f) => f.toLowerCase().endsWith(".png"));

  if (pngs.length === 0) {
    console.log(`No PNGs found in ${SRC_DIR}/`);
    return;
  }

  let written = 0;
  const names = new Set();

  for (const file of pngs) {
    const name = path.basename(file, path.extname(file));
    names.add(name);

    const src = path.join(SRC_DIR, file);
    const meta = await sharp(src).metadata();
    const maxEdge = Math.max(meta.width || 0, meta.height || 0);

    const destDir = path.join(OUT_DIR, name);
    fs.mkdirSync(destDir, { recursive: true });

    for (const size of SIZES) {
      if (size > maxEdge) continue; // never upscale / mislabel
      await sharp(src)
        .resize(size, size, { fit: "inside", withoutEnlargement: true })
        .png({ compressionLevel: 9 })
        .toFile(path.join(destDir, `${size}px.png`));
      written++;
    }
  }

  // Remove folders for icons whose source PNG was deleted
  for (const entry of fs.readdirSync(OUT_DIR, { withFileTypes: true })) {
    if (entry.isDirectory() && !names.has(entry.name)) {
      fs.rmSync(path.join(OUT_DIR, entry.name), { recursive: true, force: true });
      console.log(`removed orphan folder: ${entry.name}`);
    }
  }

  console.log(
    `Done. ${written} sized PNG(s) across ${names.size} icon(s) in ${OUT_DIR}/`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
