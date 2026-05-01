#!/usr/bin/env node
// Génère les icônes PNG pour la PWA sans dépendances externes
// Utilise une technique PNG raw bytes pour créer des icônes simples

const fs = require('fs');
const path = require('path');
const PUBLIC = path.join('C:/Users/antol/OneDrive/Documents/MONDIAL/public');

// ── Créer un PNG uni (couleur solide) ────────────────────────────────────────
function createPNG(size, r, g, b) {
  const zlib = require('zlib');

  // Chaque ligne de pixels : filtre 0 + RGBA × size
  const rowSize = 1 + size * 4;
  const raw = Buffer.alloc(rowSize * size);
  for (let y = 0; y < size; y++) {
    const offset = y * rowSize;
    raw[offset] = 0; // filtre None
    for (let x = 0; x < size; x++) {
      raw[offset + 1 + x * 4] = r;
      raw[offset + 1 + x * 4 + 1] = g;
      raw[offset + 1 + x * 4 + 2] = b;
      raw[offset + 1 + x * 4 + 3] = 255;
    }
  }

  const compressed = zlib.deflateSync(raw);

  function crc32(buf) {
    let crc = 0xFFFFFFFF;
    const table = [];
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      table[i] = c;
    }
    for (const byte of buf) crc = table[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const t = Buffer.from(type);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
    return Buffer.concat([len, t, data, crc]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB... wait we need RGBA
  // Fix: use color type 6 = RGBA
  ihdr[9] = 6;
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// Navy blue #0c1e52 = rgb(12, 30, 82)
const [r, g, b] = [12, 30, 82];

fs.writeFileSync(path.join(PUBLIC, 'icon-192.png'), createPNG(192, r, g, b));
fs.writeFileSync(path.join(PUBLIC, 'icon-512.png'), createPNG(512, r, g, b));
// Apple touch icon (180×180 requis pour iOS)
fs.writeFileSync(path.join(PUBLIC, 'apple-touch-icon.png'), createPNG(180, r, g, b));

console.log('✅ icon-192.png, icon-512.png, apple-touch-icon.png générés (navy #0c1e52)');
