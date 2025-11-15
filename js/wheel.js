// ================================
//  WHEEL.JS — MODULE PRINCIPAL
// ================================

import { playTickSound } from './sound.js';
import { showOverlay } from './overlay.js';
import { getEntries } from './entries.js';

// ==============================================
// VARIABLES DE LA ROUE
// ==============================================

const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');

const centerImg = new Image();
centerImg.src = "images/center3.avif";

let entries = getEntries();          // Importe les cases depuis entries.js
const total = entries.length;

let angle = 0;
let velocity = 0;
let spinning = false;

let lastTimestamp = 0;
let lastIndex = -1;                  // Pour détecter les changements de case
let expectedStopTime = null;

const BOOST = 0.15;
const FRICTION = 0.995;
const MIN_VELOCITY = 0.002;
const SPIN_MIN = 2800;
const SPIN_MAX = 3800;

// ==============================================
// DESSIN DE LA ROUE
// ==============================================

function resize() {
  const size = Math.min(window.innerWidth, 520);
  canvas.width = size;
  canvas.height = size;
  drawWheel();
}

window.addEventListener("resize", resize);

function drawWheel() {
  const w = canvas.width;
  const h = canvas.height;
  const radius = w / 2;

  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.translate(radius, radius);
  ctx.rotate(angle);

  const slice = (Math.PI * 2) / total;

  entries.forEach((entry, i) => {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.fillStyle = entry.color;
    ctx.arc(0, 0, radius, i * slice, (i + 1) * slice);
    ctx.fill();

    // Texte non pivoté
    ctx.save();
    ctx.rotate(i * slice + slice / 2);
    ctx.translate(radius * 0.65, 0);
    ctx.rotate(-angle - (i * slice + slice / 2));
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#000";
    ctx.font = `${Math.floor(radius * 0.09)}px sans-serif`;
    wrapText(ctx, entry.text, 0, 0, radius * 0.28, 18);
    ctx.restore();
  });

  ctx.restore();

  // Image centrale
  ctx.save();
  ctx.translate(radius, radius);
  ctx.rotate(angle);
  const imgSize = radius * 0.75;
  ctx.drawImage(centerImg, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
  ctx.restore();
}

// ==============================================
// TEXTE MULTILIGNES
// ==============================================

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth) {
      ctx.fillText(line, x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

// ==============================================
// LANCEMENT DE LA ROUE
// ==============================================

function startSpin() {
  velocity = 0.35 + Math.random() * 0.2;
  expectedStopTime = performance.now() + (SPIN_MIN + Math.random() * (SPIN_MAX - SPIN_MIN));
  spinning = true;
  lastTimestamp = performance.now();
  requestAnimationFrame(animate);
}

// ==============================================
// BOUCLE D’ANIMATION
// ==============================================

function animate(timestamp) {
  if (!spinning) return;

  const delta = timestamp - lastTimestamp;
  lastTimestamp = timestamp;

  angle += velocity;
  angle %= Math.PI * 2;

  // 🔊 Détection du passage d'une case
  const slice = (Math.PI * 2) / total;
  const currentIndex = Math.floor(((Math.PI * 2) - angle) / slice) % total;

  if (currentIndex !== lastIndex) {
    lastIndex = currentIndex;
    playTickSound();
  }

  // ⏳ Décélération si temps dépassé
  if (timestamp > expectedStopTime) {
    velocity *= FRICTION;
  }

  if (velocity < MIN_VELOCITY) {
    spinning = false;

    const chosen = entries[currentIndex];
    showOverlay(chosen.text);

    return;
  }

  drawWheel();
  requestAnimationFrame(animate);
}

// ==============================================
// BOOST AU CLIC
// ==============================================

canvas.addEventListener("click", () => {
  if (!spinning) startSpin();
  else velocity += BOOST;
});

// ==============================================
// VISIBILITY HANDLING (onglet changé)
// ==============================================

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    lastTimestamp = performance.now();
  }
});

// ==============================================
// LANCEMENT INITIAL
// ==============================================

centerImg.onload = () => {
  resize();
  drawWheel();
};

