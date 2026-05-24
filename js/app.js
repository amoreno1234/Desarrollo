// Panini Mundial 2026 - App Logic

const STORAGE_KEY = 'panini2026_owned';

let owned = new Set();
let repeated = {};
let codeReader = null;
let scannerActive = false;
let currentFilter = 'all';
let currentSearch = '';
let currentSection = 'all';

// ── Storage ────────────────────────────────────────────────────────────────

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    owned: [...owned],
    repeated,
  }));
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    owned = new Set(data.owned || []);
    repeated = data.repeated || {};
  } catch (_) {}
}

// ── Sticker toggle ─────────────────────────────────────────────────────────

function addSticker(code) {
  code = code.trim().toUpperCase();
  if (!STICKER_MAP[code]) return false;

  if (owned.has(code)) {
    repeated[code] = (repeated[code] || 1) + 1;
    showToast(`¡Repetida! ${STICKER_MAP[code].name} (×${repeated[code]})`, 'warn');
  } else {
    owned.add(code);
    showToast(`✔ ¡Agregada! ${STICKER_MAP[code].name}`, 'success');
  }
  save();
  updateStats();
  updateProgressBar();
  refreshStickerCard(code);
  return true;
}

function removeSticker(code) {
  code = code.toUpperCase();
  if (repeated[code] && repeated[code] > 1) {
    repeated[code]--;
  } else {
    delete repeated[code];
    owned.delete(code);
  }
  save();
  updateStats();
  updateProgressBar();
  refreshStickerCard(code);
}

function toggleSticker(code) {
  code = code.toUpperCase();
  if (owned.has(code)) {
    removeSticker(code);
  } else {
    addSticker(code);
  }
}

// ── Scanner ────────────────────────────────────────────────────────────────

async function startScanner() {
  const video = document.getElementById('video');
  const btn = document.getElementById('toggleCamera');
  const hint = document.getElementById('scanHint');

  if (!window.ZXing) {
    showToast('Librería de escaneo no disponible', 'error');
    return;
  }

  try {
    codeReader = new ZXing.BrowserMultiFormatReader();
    const devices = await ZXing.BrowserCodeReader.listVideoInputDevices();
    if (!devices.length) {
      showToast('No se encontró cámara', 'error');
      return;
    }
    // Prefer rear camera
    const device = devices.find(d => /back|rear|environment/i.test(d.label)) || devices[devices.length - 1];

    await codeReader.decodeFromVideoDevice(device.deviceId, video, (result, err) => {
      if (result) {
        const text = result.getText().trim().toUpperCase();
        handleScannedCode(text);
      }
    });

    scannerActive = true;
    btn.textContent = '⏹ Detener cámara';
    btn.classList.add('active');
    hint.textContent = 'Apunta la cámara al código de la estampa o empaque';
    document.getElementById('scannerOverlay').classList.add('active');
  } catch (err) {
    showToast('No se pudo acceder a la cámara. Usa HTTPS o localhost.', 'error');
    console.error(err);
  }
}

function stopScanner() {
  if (codeReader) {
    codeReader.reset();
    codeReader = null;
  }
  scannerActive = false;
  const btn = document.getElementById('toggleCamera');
  btn.textContent = '📷 Activar cámara';
  btn.classList.remove('active');
  document.getElementById('scannerOverlay').classList.remove('active');
  document.getElementById('scanHint').textContent = 'Activa la cámara o ingresa el código manualmente';
}

function handleScannedCode(code) {
  // Try direct match
  if (STICKER_MAP[code]) {
    addSticker(code);
    return;
  }
  // Try numeric — map sequential number to sticker
  const num = parseInt(code, 10);
  if (!isNaN(num)) {
    const sticker = ALL_STICKERS.find(s => s.num === num);
    if (sticker) { addSticker(sticker.code); return; }
  }
  showToast(`Código no reconocido: ${code}`, 'warn');
}

// ── Render album ───────────────────────────────────────────────────────────

function buildSectionFilter() {
  const sel = document.getElementById('sectionFilter');
  sel.innerHTML = '<option value="all">Todas las secciones</option>';

  const sections = [];
  const seen = new Set();
  for (const s of ALL_STICKERS) {
    if (!seen.has(s.section)) {
      seen.add(s.section);
      sections.push({ id: s.section, name: (s.flag ? s.flag + ' ' : '') + s.sectionName });
    }
  }
  sections.forEach(sec => {
    const opt = document.createElement('option');
    opt.value = sec.id;
    opt.textContent = sec.name;
    sel.appendChild(opt);
  });
}

function renderAlbum() {
  const grid = document.getElementById('albumGrid');
  const search = currentSearch.toLowerCase();

  let filtered = ALL_STICKERS.filter(s => {
    if (currentSection !== 'all' && s.section !== currentSection) return false;
    if (currentFilter === 'owned' && !owned.has(s.code)) return false;
    if (currentFilter === 'missing' && owned.has(s.code)) return false;
    if (currentFilter === 'repeated' && !repeated[s.code]) return false;
    if (search && !s.name.toLowerCase().includes(search) && !s.code.toLowerCase().includes(search)) return false;
    return true;
  });

  // Group by section
  const groups = {};
  for (const s of filtered) {
    if (!groups[s.section]) groups[s.section] = { name: s.sectionName, flag: s.flag || '', stickers: [] };
    groups[s.section].stickers.push(s);
  }

  grid.innerHTML = '';
  if (!filtered.length) {
    grid.innerHTML = '<div class="empty-state">No se encontraron estampas</div>';
    return;
  }

  for (const [secId, group] of Object.entries(groups)) {
    const secOwned = group.stickers.filter(s => owned.has(s.code)).length;
    const secTotal = group.stickers.length;

    const section = document.createElement('div');
    section.className = 'album-section';
    section.innerHTML = `
      <div class="section-header">
        <span class="section-title">${group.flag} ${group.name}</span>
        <span class="section-count">${secOwned}/${secTotal}</span>
      </div>
      <div class="sticker-row" id="row-${secId}"></div>
    `;
    grid.appendChild(section);

    const row = section.querySelector('.sticker-row');
    group.stickers.forEach(s => row.appendChild(createStickerCard(s)));
  }
}

function createStickerCard(sticker) {
  const card = document.createElement('div');
  card.className = 'sticker-card' + (owned.has(sticker.code) ? ' owned' : '');
  card.dataset.code = sticker.code;
  if (sticker.color) card.style.setProperty('--team-color', sticker.color);

  const rep = repeated[sticker.code];
  card.innerHTML = `
    <div class="sticker-num">${sticker.num}</div>
    <div class="sticker-icon">${typeIcon(sticker.type)}</div>
    <div class="sticker-name">${shortName(sticker.name)}</div>
    ${rep ? `<div class="sticker-rep">×${rep}</div>` : ''}
  `;
  card.addEventListener('click', () => toggleSticker(sticker.code));
  return card;
}

function refreshStickerCard(code) {
  const card = document.querySelector(`.sticker-card[data-code="${code}"]`);
  if (!card) return;
  const sticker = STICKER_MAP[code];
  if (!sticker) return;
  card.className = 'sticker-card' + (owned.has(code) ? ' owned' : '');
  const rep = repeated[code];
  card.innerHTML = `
    <div class="sticker-num">${sticker.num}</div>
    <div class="sticker-icon">${typeIcon(sticker.type)}</div>
    <div class="sticker-name">${shortName(sticker.name)}</div>
    ${rep ? `<div class="sticker-rep">×${rep}</div>` : ''}
  `;
  card.addEventListener('click', () => toggleSticker(code));
}

function typeIcon(type) {
  const icons = { badge: '🛡️', team: '📸', player: '⚽', special: '⭐', stadium: '🏟️' };
  return icons[type] || '🃏';
}

function shortName(name) {
  return name.length > 18 ? name.slice(0, 16) + '…' : name;
}

// ── Stats ──────────────────────────────────────────────────────────────────

function updateStats() {
  const total = owned.size;
  const missing = TOTAL - total;
  const rep = Object.values(repeated).reduce((a, v) => a + v - 1, 0);
  const pct = Math.round((total / TOTAL) * 100);

  document.getElementById('statOwned').textContent = total;
  document.getElementById('statMissing').textContent = missing;
  document.getElementById('statPercent').textContent = pct + '%';
  document.getElementById('statRepeated').textContent = rep;

  renderTeamProgress();
}

function updateProgressBar() {
  const pct = Math.round((owned.size / TOTAL) * 100);
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressLabel').textContent = `${owned.size} / ${TOTAL} (${pct}%)`;
}

function renderTeamProgress() {
  const container = document.getElementById('teamProgress');
  container.innerHTML = '';

  const teamSections = TEAMS.map(team => {
    const teamStickers = ALL_STICKERS.filter(s => s.section === team.id);
    const teamOwned = teamStickers.filter(s => owned.has(s.code)).length;
    return { team, total: teamStickers.length, owned: teamOwned };
  });

  teamSections.sort((a, b) => (b.owned / b.total) - (a.owned / a.total));

  for (const { team, total, owned: ow } of teamSections) {
    const pct = Math.round((ow / total) * 100);
    const row = document.createElement('div');
    row.className = 'team-row';
    row.innerHTML = `
      <span class="team-flag">${team.flag}</span>
      <span class="team-name">${team.name}</span>
      <div class="team-bar-wrap">
        <div class="team-bar" style="width:${pct}%;background:${team.color || '#4CAF50'}"></div>
      </div>
      <span class="team-pct">${ow}/${total}</span>
    `;
    container.appendChild(row);
  }
}

// ── Export / Import ────────────────────────────────────────────────────────

function exportList() {
  const lines = ['=== PANINI MUNDIAL 2026 - Mi Colección ===\n'];
  lines.push(`Tengo: ${owned.size} / ${TOTAL} estampas\n\n`);

  lines.push('--- TENGO ---');
  for (const code of [...owned].sort()) {
    const s = STICKER_MAP[code];
    const rep = repeated[code] ? ` (×${repeated[code]})` : '';
    lines.push(`#${s.num} [${code}] ${s.sectionName} - ${s.name}${rep}`);
  }

  lines.push('\n--- ME FALTAN ---');
  for (const s of ALL_STICKERS) {
    if (!owned.has(s.code)) lines.push(`#${s.num} [${s.code}] ${s.sectionName} - ${s.name}`);
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'panini_mundial_2026.txt';
  a.click();
  URL.revokeObjectURL(url);
}

function resetAlbum() {
  if (!confirm('¿Reiniciar todo el álbum? Se perderán tus estampas guardadas.')) return;
  owned.clear();
  repeated = {};
  save();
  updateStats();
  updateProgressBar();
  renderAlbum();
  showToast('Álbum reiniciado', 'warn');
}

// ── Toast ──────────────────────────────────────────────────────────────────

function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast show ${type}`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ── Navigation ─────────────────────────────────────────────────────────────

function switchTab(tab) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
  document.querySelector(`.nav-item[data-tab="${tab}"]`).classList.add('active');
  if (tab !== 'scanner' && scannerActive) stopScanner();
  if (tab === 'album') renderAlbum();
  if (tab === 'stats') { updateStats(); }
}

// ── Init ───────────────────────────────────────────────────────────────────

function init() {
  load();
  buildSectionFilter();
  updateProgressBar();
  updateStats();

  // Navigation
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Camera toggle
  document.getElementById('toggleCamera').addEventListener('click', () => {
    if (scannerActive) stopScanner(); else startScanner();
  });

  // Manual add
  const codeInput = document.getElementById('codeInput');
  document.getElementById('addBtn').addEventListener('click', () => {
    const val = codeInput.value.trim();
    if (!val) return;
    if (!addSticker(val)) showToast(`Código no encontrado: ${val}`, 'error');
    codeInput.value = '';
  });
  codeInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('addBtn').click();
  });

  // Filters
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderAlbum();
    });
  });

  // Section dropdown
  document.getElementById('sectionFilter').addEventListener('change', e => {
    currentSection = e.target.value;
    renderAlbum();
  });

  // Search
  document.getElementById('searchInput').addEventListener('input', e => {
    currentSearch = e.target.value;
    renderAlbum();
  });

  // Export / Reset
  document.getElementById('exportBtn').addEventListener('click', exportList);
  document.getElementById('resetBtn').addEventListener('click', resetAlbum);
}

document.addEventListener('DOMContentLoaded', init);
