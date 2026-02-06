#!/usr/bin/env node
/**
 * Generate placeholder PWA icon PNGs (solid teal circle with white "H").
 *
 * Uses only Node.js built-in modules (no external dependencies).
 * Run once:  node scripts/generate-pwa-icons.mjs
 *
 * Replace the generated files with real branded icons when ready.
 */

import { writeFileSync, mkdirSync } from "fs";
import { deflateSync } from "zlib";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ICONS_DIR = resolve(__dirname, "../public/icons");

// Teal primary (#0d9488) and white
const TEAL = [13, 148, 136];
const WHITE = [255, 255, 255];
const BG = [248, 250, 252]; // slate-50 background

// ---- PNG helpers (built-in zlib, no canvas needed) ----

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, "ascii");
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePNG(width, height, pixels) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  // Raw rows: filter-byte (0) + RGB per pixel
  const rowLen = 1 + width * 3;
  const raw = Buffer.alloc(rowLen * height);
  for (let y = 0; y < height; y++) {
    raw[y * rowLen] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 3;
      const dst = y * rowLen + 1 + x * 3;
      raw[dst] = pixels[src];
      raw[dst + 1] = pixels[src + 1];
      raw[dst + 2] = pixels[src + 2];
    }
  }

  const compressed = deflateSync(raw, { level: 9 });

  return Buffer.concat([
    sig,
    makeChunk("IHDR", ihdr),
    makeChunk("IDAT", compressed),
    makeChunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---- Drawing helpers ----

function createPixels(size) {
  return new Uint8Array(size * size * 3);
}

function setPixel(pixels, size, x, y, r, g, b) {
  const i = (y * size + x) * 3;
  pixels[i] = r;
  pixels[i + 1] = g;
  pixels[i + 2] = b;
}

function dist(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

/**
 * Draw a teal circle with a white "H" on a light background.
 * maskable = true  → fill entire square (safe zone is inner 80%)
 * maskable = false → circle with slight padding
 */
function drawIconH(size, maskable = false) {
  const pixels = createPixels(size);
  const cx = size / 2;
  const cy = size / 2;
  const radius = maskable ? size / 2 : size * 0.44;

  // Fill background
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (maskable || dist(x, y, cx, cy) <= radius) {
        setPixel(pixels, size, x, y, ...TEAL);
      } else {
        setPixel(pixels, size, x, y, ...BG);
      }
    }
  }

  // Draw "H" letter (white)
  const hScale = maskable ? 0.32 : 0.34;
  const hW = Math.round(size * hScale); // total width of H
  const hH = Math.round(size * hScale * 1.2); // total height of H
  const stroke = Math.max(Math.round(size * 0.07), 2); // stroke width
  const left = Math.round(cx - hW / 2);
  const top = Math.round(cy - hH / 2);

  for (let y = top; y < top + hH; y++) {
    for (let x = left; x < left + stroke; x++) {
      if (x >= 0 && x < size && y >= 0 && y < size) setPixel(pixels, size, x, y, ...WHITE);
    }
    for (let x = left + hW - stroke; x < left + hW; x++) {
      if (x >= 0 && x < size && y >= 0 && y < size) setPixel(pixels, size, x, y, ...WHITE);
    }
  }
  // Horizontal bar
  const barY = Math.round(cy - stroke / 2);
  for (let y = barY; y < barY + stroke; y++) {
    for (let x = left; x < left + hW; x++) {
      if (x >= 0 && x < size && y >= 0 && y < size) setPixel(pixels, size, x, y, ...WHITE);
    }
  }

  return pixels;
}

/**
 * Draw inverted: white circle with a teal "H".
 */
function drawIconHInverted(size, maskable = false) {
  const pixels = createPixels(size);
  const cx = size / 2;
  const cy = size / 2;
  const radius = maskable ? size / 2 : size * 0.44;

  // Fill background (white circle, white square for maskable)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (maskable || dist(x, y, cx, cy) <= radius) {
        setPixel(pixels, size, x, y, ...WHITE);
      } else {
        setPixel(pixels, size, x, y, ...BG);
      }
    }
  }

  // Draw "H" letter (teal)
  const hScale = maskable ? 0.32 : 0.34;
  const hW = Math.round(size * hScale);
  const hH = Math.round(size * hScale * 1.2);
  const stroke = Math.max(Math.round(size * 0.07), 2);
  const left = Math.round(cx - hW / 2);
  const top = Math.round(cy - hH / 2);

  for (let y = top; y < top + hH; y++) {
    for (let x = left; x < left + stroke; x++) {
      if (x >= 0 && x < size && y >= 0 && y < size) setPixel(pixels, size, x, y, ...TEAL);
    }
    for (let x = left + hW - stroke; x < left + hW; x++) {
      if (x >= 0 && x < size && y >= 0 && y < size) setPixel(pixels, size, x, y, ...TEAL);
    }
  }
  const barY = Math.round(cy - stroke / 2);
  for (let y = barY; y < barY + stroke; y++) {
    for (let x = left; x < left + hW; x++) {
      if (x >= 0 && x < size && y >= 0 && y < size) setPixel(pixels, size, x, y, ...TEAL);
    }
  }

  return pixels;
}

/**
 * Draw a teal circle with a white plus symbol "+".
 */
function drawIconPlus(size, maskable = false) {
  const pixels = createPixels(size);
  const cx = size / 2;
  const cy = size / 2;
  const radius = maskable ? size / 2 : size * 0.44;

  // Fill background
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (maskable || dist(x, y, cx, cy) <= radius) {
        setPixel(pixels, size, x, y, ...TEAL);
      } else {
        setPixel(pixels, size, x, y, ...BG);
      }
    }
  }

  // Draw plus symbol "+" (white)
  const plusScale = maskable ? 0.28 : 0.30;
  const plusSize = Math.round(size * plusScale);
  const stroke = Math.max(Math.round(size * 0.08), 2);
  const left = Math.round(cx - plusSize / 2);
  const right = Math.round(cx + plusSize / 2);
  const top = Math.round(cy - plusSize / 2);
  const bottom = Math.round(cy + plusSize / 2);

  // Vertical bar
  const vLeft = Math.round(cx - stroke / 2);
  for (let y = top; y < bottom; y++) {
    for (let x = vLeft; x < vLeft + stroke; x++) {
      if (x >= 0 && x < size && y >= 0 && y < size) setPixel(pixels, size, x, y, ...WHITE);
    }
  }
  // Horizontal bar
  const hTop = Math.round(cy - stroke / 2);
  for (let x = left; x < right; x++) {
    for (let y = hTop; y < hTop + stroke; y++) {
      if (x >= 0 && x < size && y >= 0 && y < size) setPixel(pixels, size, x, y, ...WHITE);
    }
  }

  return pixels;
}

/**
 * Draw inverted: white circle with a teal plus symbol "+".
 */
function drawIconPlusInverted(size, maskable = false) {
  const pixels = createPixels(size);
  const cx = size / 2;
  const cy = size / 2;
  const radius = maskable ? size / 2 : size * 0.44;

  // Fill background (white)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (maskable || dist(x, y, cx, cy) <= radius) {
        setPixel(pixels, size, x, y, ...WHITE);
      } else {
        setPixel(pixels, size, x, y, ...BG);
      }
    }
  }

  // Draw plus symbol "+" (teal)
  const plusScale = maskable ? 0.28 : 0.30;
  const plusSize = Math.round(size * plusScale);
  const stroke = Math.max(Math.round(size * 0.08), 2);
  const left = Math.round(cx - plusSize / 2);
  const right = Math.round(cx + plusSize / 2);
  const top = Math.round(cy - plusSize / 2);
  const bottom = Math.round(cy + plusSize / 2);

  // Vertical bar
  const vLeft = Math.round(cx - stroke / 2);
  for (let y = top; y < bottom; y++) {
    for (let x = vLeft; x < vLeft + stroke; x++) {
      if (x >= 0 && x < size && y >= 0 && y < size) setPixel(pixels, size, x, y, ...TEAL);
    }
  }
  // Horizontal bar
  const hTop = Math.round(cy - stroke / 2);
  for (let x = left; x < right; x++) {
    for (let y = hTop; y < hTop + stroke; y++) {
      if (x >= 0 && x < size && y >= 0 && y < size) setPixel(pixels, size, x, y, ...TEAL);
    }
  }

  return pixels;
}

// ---- Generate icons ----

mkdirSync(ICONS_DIR, { recursive: true });

const SIZES = [
  { name: "192x192", size: 192 },
  { name: "512x512", size: 512 },
  { name: "180x180", size: 180 }, // apple-touch-icon
];

const VARIANTS = [
  {
    prefix: "icon",
    drawFn: drawIconH,
    description: "H (white on teal)",
    isPWA: true, // These are the main PWA icons
  },
  {
    prefix: "icon-h-inverted",
    drawFn: drawIconHInverted,
    description: "H inverted (teal on white)",
    isPWA: false,
  },
  {
    prefix: "icon-plus",
    drawFn: drawIconPlus,
    description: "Plus (white on teal)",
    isPWA: false,
  },
  {
    prefix: "icon-plus-inverted",
    drawFn: drawIconPlusInverted,
    description: "Plus inverted (teal on white)",
    isPWA: false,
  },
];

for (const variant of VARIANTS) {
  for (const { name, size } of SIZES) {
    // Skip apple-touch-icon for non-PWA variants
    if (!variant.isPWA && name === "180x180") continue;

    // For PWA 512x512, generate both regular and maskable
    if (variant.isPWA && name === "512x512") {
      // Regular 512x512
      const filenameRegular = `${variant.prefix}-${name}.png`;
      const pixelsRegular = variant.drawFn(size, false);
      const pngRegular = encodePNG(size, size, pixelsRegular);
      writeFileSync(resolve(ICONS_DIR, filenameRegular), pngRegular);
      console.log(`  Created ${filenameRegular} (${size}x${size}, ${pngRegular.length} bytes) - ${variant.description}`);

      // Maskable 512x512
      const filenameMaskable = `icon-maskable-${name}.png`;
      const pixelsMaskable = variant.drawFn(size, true);
      const pngMaskable = encodePNG(size, size, pixelsMaskable);
      writeFileSync(resolve(ICONS_DIR, filenameMaskable), pngMaskable);
      console.log(`  Created ${filenameMaskable} (${size}x${size}, ${pngMaskable.length} bytes) - ${variant.description} (maskable)`);
      continue;
    }

    // Regular generation for other sizes
    const filename =
      variant.isPWA && name === "180x180"
        ? "apple-touch-icon.png"
        : `${variant.prefix}-${name}.png`;

    const pixels = variant.drawFn(size, false);
    const png = encodePNG(size, size, pixels);
    const path = resolve(ICONS_DIR, filename);
    writeFileSync(path, png);
    console.log(`  Created ${filename} (${size}x${size}, ${png.length} bytes) - ${variant.description}`);
  }
}

console.log("\nDone. Generated all icon variants:");
console.log("  - Original H icons (for PWA manifest)");
console.log("  - Inverted H icons");
console.log("  - Plus symbol icons");
console.log("  - Inverted plus symbol icons");
console.log("\nReplace with real branded icons when ready.");
