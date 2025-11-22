// bills.js — effet billets (version WebAudio API — 100% mobile safe)
// Usage: spawnBills(eventOrCoords, count)

(() => {

  /******************************
   *   INITIALISATION AUDIO
   ******************************/
  let audioCtx = null;
  let billBuffer = null;

  const initAudio = async () => {
    if (audioCtx) return;

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    const response = await fetch("audio/frottement-papier2.mp3");
    const arrayBuffer = await response.arrayBuffer();
    billBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  };

  // Déblocage audio mobile
  window.addEventListener("touchstart", initAudio, { once: true });
  window.addEventListener("mousedown", initAudio, { once: true });

  const playBillSound = () => {
    if (!audioCtx || !billBuffer) return;

    const source = audioCtx.createBufferSource();
    source.buffer = billBuffer;

    // Légère variation de pitch pour rendre naturel
    source.playbackRate.value = 1.35 + Math.random() * 0.20;

    source.connect(audioCtx.destination);
    source.start(0);
  };

  /******************************
   *   PARAMÈTRES ANIMATION
   ******************************/
  const MAX_BILLS = 64;
  const GRAVITY = 12;
  const AIR = 0.980;
  const LIFETIME = 10000;
  const SIZE_BASE = 24;
  const OUTER_FORCE = 9.5;
  const ROT_RANGE = 360;

  const activeBills = [];

  const rand = (min, max) => Math.random() * (max - min) + min;

  /******************************
   *   CRÉATION D'UN BILLET
   ******************************/
  const createBill = (x, y) => {
    // Limite DOM
    if (activeBills.length >= MAX_BILLS) {
      const old = activeBills.shift();
      old.el.remove();
    }

    const el = document.createElement("div");
    el.className = "bill";
    el.textContent = "💸";

    const size = SIZE_BASE + rand(-6, 6);
    el.style.fontSize = size + "px";

    document.body.appendChild(el);

    const angle = rand(0, Math.PI * 2);
    const speed = rand(OUTER_FORCE * 0.4, OUTER_FORCE);

    const bill = {
      el,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      rot: rand(-ROT_RANGE, ROT_RANGE),
      life: 0,
    };

    activeBills.push(bill);
    playBillSound();

    return bill;
  };

  /******************************
   *   MISE À JOUR ANIMATION
   ******************************/
  const update = (dt) => {
    for (let i = activeBills.length - 1; i >= 0; i--) {
      const b = activeBills[i];

      b.vy += GRAVITY * dt;
      b.vx *= AIR;
      b.vy *= AIR;

      b.x += b.vx * dt * 60;
      b.y += b.vy * dt * 60;
      b.rot += b.vx * 0.3;

      b.life += dt * 1000;

      b.el.style.transform =
        `translate(${b.x}px, ${b.y}px) rotate(${b.rot}deg)`;

      if (b.life >= LIFETIME) {
        b.el.style.transition = "opacity 0.5s";
        b.el.style.opacity = "0";
        setTimeout(() => b.el.remove(), 600);
        activeBills.splice(i, 1);
      }
    }
  };

  /******************************
   *   RAF
   ******************************/
  let last = performance.now();

  const frame = (t) => {
    const dt = Math.min((t - last) / 1000, 0.033);
    last = t;

    update(dt);
    requestAnimationFrame(frame);
  };

  requestAnimationFrame(frame);

  /******************************
   *   SPAWN EXTERNE
   ******************************/
  window.spawnBills = (e, count = 12) => {
    let x, y;

    if (e && e.clientX != null) {
      x = e.clientX;
      y = e.clientY;
    } else if (e?.touches?.length) {
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    } else {
      x = e?.x ?? window.innerWidth / 2;
      y = e?.y ?? window.innerHeight / 2;
    }

    for (let i = 0; i < count; i++) {
      createBill(x, y);
    }
  };

})();
