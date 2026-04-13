/**
 * Genera frontend/public/og-image.png (1200×630px)
 * Requiere: npm install canvas   (solo para este script, no va al bundle)
 * Uso:      node scripts/generar-og-image.mjs
 */
import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../public/og-image.png');

const W = 1200, H = 630;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

// Fondo degradado verde → blanco
const grad = ctx.createLinearGradient(0, 0, W, H);
grad.addColorStop(0, '#f0fae8');
grad.addColorStop(1, '#ffffff');
ctx.fillStyle = grad;
ctx.fillRect(0, 0, W, H);

// Círculo decorativo fondo
ctx.beginPath();
ctx.arc(W - 160, H / 2, 320, 0, Math.PI * 2);
ctx.fillStyle = '#91cf5b18';
ctx.fill();

// Logo texto "Fresco"
ctx.font = 'bold 120px sans-serif';
ctx.fillStyle = '#91cf5b';
ctx.textBaseline = 'middle';
ctx.fillText('Fresco', 80, H / 2 - 60);

// Tagline
ctx.font = '38px sans-serif';
ctx.fillStyle = '#374151';
ctx.fillText('El POS para negocios frescos.', 80, H / 2 + 40);

// URL
ctx.font = '28px sans-serif';
ctx.fillStyle = '#9ca3af';
ctx.fillText('frescopos.cl', 80, H / 2 + 110);

// Guardar
const buf = canvas.toBuffer('image/png');
writeFileSync(OUT, buf);
console.log(`og-image.png generado en ${OUT}`);
