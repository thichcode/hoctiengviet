const STORAGE_KEYS = {
  names: "wn_names",
  removeAfterWin: "wn_remove_after_win",
};

const DEFAULT_NAMES = [
  "Lan",
  "Hùng",
  "Minh",
  "Thảo",
  "Quang",
  "Anh",
  "Linh",
  "Nam",
];

const elements = {
  textarea: document.getElementById("txt-names"),
  wheel: document.getElementById("wheel"),
  spin: document.getElementById("btn-spin"),
  shuffle: document.getElementById("btn-shuffle"),
  clear: document.getElementById("btn-clear"),
  importBtn: document.getElementById("btn-import"),
  importFile: document.getElementById("file-import"),
  exportBtn: document.getElementById("btn-export"),
  removeChk: document.getElementById("chk-remove"),
  fullscreen: document.getElementById("btn-fullscreen"),
  modal: document.getElementById("winner-modal"),
  winner: document.getElementById("winner-name"),
  closeModal: document.getElementById("btn-close-modal"),
  spinAgain: document.getElementById("btn-spin-again"),
  confetti: document.getElementById("confetti"),
};

const colorPalette = [
  "#6D8BFF", "#2CD4A6", "#FFB84D", "#FF6D6D", "#B57BFF", "#4DD2FF", "#FFD166", "#EF476F",
];

let names = [];
let baseAngleRad = -Math.PI / 2; // pointer at 12 o'clock
let currentAngleRad = 0;
let isSpinning = false;
let lastSliceIndexTick = null;

const ctx = elements.wheel.getContext("2d");

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.names);
    names = saved ? JSON.parse(saved) : DEFAULT_NAMES.slice();
  } catch (_) {
    names = DEFAULT_NAMES.slice();
  }
  const remove = localStorage.getItem(STORAGE_KEYS.removeAfterWin);
  elements.removeChk.checked = remove === "1";
  elements.textarea.value = names.join("\n");
}

function saveNames() {
  const normalized = names.filter((n) => n && n.trim()).map((n) => n.trim());
  names = normalized;
  localStorage.setItem(STORAGE_KEYS.names, JSON.stringify(names));
}

function setCanvasSize() {
  const size = Math.min(elements.wheel.clientWidth || 600, elements.wheel.clientHeight || 600);
  const pixelRatio = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const finalSize = Math.max(300, size);
  elements.wheel.width = finalSize * pixelRatio;
  elements.wheel.height = finalSize * pixelRatio;
  elements.wheel.style.width = finalSize + "px";
  elements.wheel.style.height = finalSize + "px";
  ctx.reset?.();
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

function drawWheel() {
  setCanvasSize();
  const w = elements.wheel.width / (window.devicePixelRatio ? Math.max(1, Math.min(2, window.devicePixelRatio)) : 1);
  const h = elements.wheel.height / (window.devicePixelRatio ? Math.max(1, Math.min(2, window.devicePixelRatio)) : 1);
  const cx = w / 2;
  const cy = h / 2;
  const radius = Math.min(cx, cy) - 8;

  ctx.clearRect(0, 0, w, h);

  if (names.length === 0) {
    ctx.fillStyle = "#243056";
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#9aa3c7";
    ctx.font = "600 18px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Thêm tên để bắt đầu", cx, cy);
    return;
  }

  const sliceAngle = (Math.PI * 2) / names.length;

  // slices
  for (let i = 0; i < names.length; i++) {
    const start = baseAngleRad + currentAngleRad + i * sliceAngle;
    const end = start + sliceAngle;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = colorPalette[i % colorPalette.length];
    ctx.globalAlpha = 0.9;
    ctx.fill();
    ctx.globalAlpha = 1;

    // slice separators
    ctx.strokeStyle = "rgba(0,0,0,.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, start, start);
    ctx.lineTo(cx + Math.cos(end) * radius, cy + Math.sin(end) * radius);
    ctx.stroke();
  }

  // center circle
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(24, radius * 0.12), 0, Math.PI * 2);
  ctx.fillStyle = "#0e1534";
  ctx.fill();
  ctx.strokeStyle = "#2a3365";
  ctx.lineWidth = 2;
  ctx.stroke();

  // labels
  ctx.fillStyle = "#0b0e1a";
  ctx.font = `600 ${Math.max(12, radius * 0.08)}px Inter, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < names.length; i++) {
    const start = baseAngleRad + currentAngleRad + i * sliceAngle;
    const angle = start + sliceAngle / 2;
    const rx = cx + Math.cos(angle) * radius * 0.62;
    const ry = cy + Math.sin(angle) * radius * 0.62;
    const label = truncateLabel(names[i], 20);

    ctx.save();
    ctx.translate(rx, ry);
    ctx.rotate(angle);
    ctx.fillStyle = "#0b0e1a";
    ctx.fillText(label, 0, 0);
    ctx.restore();
  }
}

function truncateLabel(text, max) {
  const t = String(text || "").trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1) + "…";
}

function pickIndexAtPointer() {
  if (names.length === 0) return -1;
  const sliceAngle = (Math.PI * 2) / names.length;
  const normalized = ((currentAngleRad % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  // pointer at baseAngleRad (12 o'clock), so which slice center matches that
  const pointerAngle = ((-normalized) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
  const index = Math.floor(((pointerAngle - 0) / sliceAngle + names.length) % names.length);
  return index;
}

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function spinWheel() {
  if (isSpinning) return;
  if (names.length < 2) { shakeButton(elements.spin); return; }
  isSpinning = true;

  const targetIndex = Math.floor(Math.random() * names.length);
  const sliceAngle = (Math.PI * 2) / names.length;
  const targetPointerAngle = targetIndex * sliceAngle + sliceAngle / 2; // where we want (-current) to end up

  // Compute angle delta so that pointer lands in the middle of target slice
  const normalizedCurrent = ((currentAngleRad % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  let delta = -targetPointerAngle - normalizedCurrent; // because pointerAngle = (-current) mod 2π
  delta = ((delta % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

  const extraSpins = 3 + Math.floor(Math.random() * 3); // 3-5 extra spins
  const totalDelta = delta + extraSpins * Math.PI * 2;
  const durationMs = 3800 + Math.random() * 1200;

  const start = performance.now();

  function frame(now) {
    const t = Math.min(1, (now - start) / durationMs);
    const eased = easeOutCubic(t);
    const angle = totalDelta * eased;
    currentAngleRad = normalizedCurrent + angle;

    // slice tick
    const idx = pickIndexAtPointer();
    if (idx !== lastSliceIndexTick) {
      lastSliceIndexTick = idx;
      // optional: play tick sound here
    }

    drawWheel();

    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      isSpinning = false;
      const winnerIndex = pickIndexAtPointer();
      const winner = names[winnerIndex];
      showWinner(winner, winnerIndex);
    }
  }
  requestAnimationFrame(frame);
}

function showWinner(value, index) {
  if (!value) return;
  elements.winner.textContent = value;
  elements.modal.setAttribute("aria-hidden", "false");
  startConfetti(2200);

  if (elements.removeChk.checked) {
    // Remove winner and persist
    names.splice(index, 1);
    elements.textarea.value = names.join("\n");
    saveNames();
    drawWheel();
  }
}

function hideWinner() {
  elements.modal.setAttribute("aria-hidden", "true");
  stopConfetti();
}

function shuffleNames() {
  for (let i = names.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [names[i], names[j]] = [names[j], names[i]];
  }
  elements.textarea.value = names.join("\n");
  saveNames();
  drawWheel();
}

function clearNames() {
  names = [];
  elements.textarea.value = "";
  saveNames();
  drawWheel();
}

function onTextareaInput() {
  const raw = elements.textarea.value.split(/\r?\n/).map((s) => s.trim());
  names = raw.filter(Boolean);
  saveNames();
  drawWheel();
}

function onToggleRemove() {
  localStorage.setItem(STORAGE_KEYS.removeAfterWin, elements.removeChk.checked ? "1" : "0");
}

function exportNames() {
  const blob = new Blob([JSON.stringify({ names }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  elements.exportBtn.href = url;
}

function importNamesFromFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      let imported = [];
      if (file.type.includes("json")) {
        const obj = JSON.parse(String(reader.result));
        if (Array.isArray(obj)) imported = obj;
        else if (Array.isArray(obj.names)) imported = obj.names;
      } else {
        imported = String(reader.result).split(/\r?\n/);
      }
      names = imported.map((x) => String(x).trim()).filter(Boolean);
      elements.textarea.value = names.join("\n");
      saveNames();
      drawWheel();
    } catch (e) {
      alert("Tệp không hợp lệ");
    }
  };
  reader.readAsText(file);
}

function shakeButton(btn) {
  btn.animate([
    { transform: "translateX(0)" },
    { transform: "translateX(-6px)" },
    { transform: "translateX(6px)" },
    { transform: "translateX(0)" },
  ], { duration: 300, iterations: 1 });
}

// Confetti system (simple)
let confettiParticles = [];
let confettiRaf = null;

function startConfetti(ms = 2000) {
  const canvas = elements.confetti;
  const ctx2 = canvas.getContext("2d");
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

  function resize() {
    const rect = elements.modal.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";
    ctx2.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();

  confettiParticles = Array.from({ length: 160 }, () => createParticle(canvas.width / dpr, canvas.height / dpr));

  const startTime = performance.now();

  function frame(now) {
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx2.clearRect(0, 0, w, h);

    confettiParticles.forEach((p) => {
      p.vy += 0.02; // gravity
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vr;
      if (p.y > h + 20) {
        p.y = -10;
        p.x = Math.random() * w;
        p.vy = 0.5 + Math.random() * 1.5;
      }
      drawRectConfetti(ctx2, p);
    });

    if (now - startTime < ms) {
      confettiRaf = requestAnimationFrame(frame);
    }
  }
  confettiRaf = requestAnimationFrame(frame);
}

function stopConfetti() {
  if (confettiRaf) cancelAnimationFrame(confettiRaf);
  confettiRaf = null;
  confettiParticles = [];
  const ctx2 = elements.confetti.getContext("2d");
  ctx2 && ctx2.clearRect(0, 0, elements.confetti.width, elements.confetti.height);
}

function createParticle(w, h) {
  const colors = colorPalette;
  return {
    x: Math.random() * w,
    y: -10 - Math.random() * h * 0.2,
    vx: -1 + Math.random() * 2,
    vy: 0.5 + Math.random() * 1.5,
    w: 4 + Math.random() * 6,
    h: 6 + Math.random() * 10,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * Math.PI,
    vr: (-0.2 + Math.random() * 0.4),
  };
}

function drawRectConfetti(ctx2, p) {
  ctx2.save();
  ctx2.translate(p.x, p.y);
  ctx2.rotate(p.rotation);
  ctx2.fillStyle = p.color;
  ctx2.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
  ctx2.restore();
}

// Fullscreen
async function toggleFullscreen() {
  const el = document.documentElement;
  if (!document.fullscreenElement) {
    await el.requestFullscreen?.();
  } else {
    await document.exitFullscreen?.();
  }
}

function onResize() { drawWheel(); }

// Init
function init() {
  loadState();
  drawWheel();

  elements.textarea.addEventListener("input", onTextareaInput);
  elements.spin.addEventListener("click", spinWheel);
  elements.shuffle.addEventListener("click", shuffleNames);
  elements.clear.addEventListener("click", clearNames);
  elements.removeChk.addEventListener("change", onToggleRemove);
  elements.exportBtn.addEventListener("click", exportNames);
  elements.importBtn.addEventListener("click", () => elements.importFile.click());
  elements.importFile.addEventListener("change", (e) => importNamesFromFile(e.target.files?.[0]));
  elements.closeModal.addEventListener("click", hideWinner);
  elements.spinAgain.addEventListener("click", () => { hideWinner(); setTimeout(spinWheel, 50); });
  elements.fullscreen.addEventListener("click", toggleFullscreen);
  window.addEventListener("resize", onResize);
}

init();