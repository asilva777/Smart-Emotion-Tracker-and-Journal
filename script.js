// Dynamic language translations (expand as needed)
const translations = {
  en: {
    emotion: "Emotion",
    notes: "Notes",
    activityTags: "Activity Tags",
    add: "Add",
    save: "Save Entry",
    entries: "Entries",
    emotionChart: "Emotion Chart",
    exportData: "Export Data",
    importData: "Import Data",
    install: "Install App",
    addCustomEmotion: "Add custom emotion",
    delete: "Delete",
    maxChars: "Max 250 characters.",
    bp: "Blood Pressure",
    bpFormat: "Format: 120/80",
    entrySaved: "Entry saved!",
    entryDeleted: "Entry deleted.",
    tagAdded: "Tag added.",
    tagDeleted: "Tag removed.",
    emotionAdded: "Emotion added.",
    emotionExists: "Emotion already exists.",
    importSuccess: "Data imported!",
    exportSuccess: "Data exported.",
    error: "Error",
    invalidBP: "Blood pressure must be in format 120/80.",
    installPrompt: "Install this app on your device.",
    installSuccess: "App installed!",
    installDismissed: "Install dismissed."
  },
  es: {
    emotion: "Emoción",
    notes: "Notas",
    activityTags: "Etiquetas de actividad",
    add: "Añadir",
    save: "Guardar entrada",
    entries: "Entradas",
    emotionChart: "Gráfico de emociones",
    exportData: "Exportar datos",
    importData: "Importar datos",
    install: "Instalar App",
    addCustomEmotion: "Añadir emoción personalizada",
    delete: "Eliminar",
    maxChars: "Máx. 250 caracteres.",
    bp: "Presión arterial",
    bpFormat: "Formato: 120/80",
    entrySaved: "¡Entrada guardada!",
    entryDeleted: "Entrada eliminada.",
    tagAdded: "Etiqueta añadida.",
    tagDeleted: "Etiqueta eliminada.",
    emotionAdded: "Emoción añadida.",
    emotionExists: "La emoción ya existe.",
    importSuccess: "¡Datos importados!",
    exportSuccess: "Datos exportados.",
    error: "Error",
    invalidBP: "La presión debe tener formato 120/80.",
    installPrompt: "Instala esta app en tu dispositivo.",
    installSuccess: "¡App instalada!",
    installDismissed: "Instalación cancelada."
  }
};

let lang = localStorage.getItem('lang') || 'en';
let emotions = JSON.parse(localStorage.getItem('emotions')) || [
  "Happy", "Sad", "Angry", "Relaxed", "Anxious", "Excited", "Tired"
];
let tags = JSON.parse(localStorage.getItem('tags')) || [];
let entries = JSON.parse(localStorage.getItem('entries')) || [];
let customTheme = JSON.parse(localStorage.getItem('theme')) || "auto";
let deferredPrompt = null;

const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

function t(key) {
  return translations[lang][key] || key;
}

function setLang(newLang) {
  lang = newLang;
  localStorage.setItem('lang', lang);
  updateTexts();
}

function updateTexts() {
  $('#emotionSelect').previousElementSibling.textContent = t('emotion');
  $('#noteInput').previousElementSibling.textContent = t('notes');
  $('#activityTags').previousElementSibling.textContent = t('activityTags');
  $('#addTagBtn').textContent = t('add');
  $('#addEmotionBtn').ariaLabel = t('addCustomEmotion');
  $('#bpInput').previousElementSibling.textContent = t('bp');
  $('#bpHelp').textContent = t('bpFormat');
  $('#noteHelp').textContent = t('maxChars');
  $('#entryFormTitle').textContent = t('save');
  $('#entriesTitle').textContent = t('entries');
  $('#statsTitle').textContent = t('emotionChart');
  $('#exportBtn').textContent = t('exportData');
  $('#importBtn').textContent = t('importData');
  $('#installBtn').textContent = t('install');
}

function renderEmotions() {
  const select = $('#emotionSelect');
  select.innerHTML = "";
  emotions.forEach(e => {
    const option = document.createElement('option');
    option.value = e;
    option.textContent = e;
    select.appendChild(option);
  });
}

function renderTags() {
  const tagsDiv = $('#activityTags');
  tagsDiv.innerHTML = '';
  tags.forEach((tag, idx) => {
    const tagEl = document.createElement('span');
    tagEl.className = 'tag';
    tagEl.textContent = tag;
    tagEl.setAttribute('role', 'listitem');
    const delBtn = document.createElement('button');
    delBtn.type = "button";
    delBtn.ariaLabel = `${t('delete')} ${tag}`;
    delBtn.textContent = '×';
    delBtn.onclick = () => removeTag(idx);
    tagEl.appendChild(delBtn);
    tagsDiv.appendChild(tagEl);
  });
}

function renderEntries() {
  const ul = $('#entriesList');
  ul.innerHTML = '';
  if (entries.length === 0) {
    const li = document.createElement('li');
    li.textContent = '—';
    ul.appendChild(li);
    return;
  }
  entries.slice().reverse().forEach((entry, idx) => {
    const li = document.createElement('li');
    li.className = 'entry';
    li.tabIndex = 0;
    li.innerHTML = `
      <strong>${entry.emotion}</strong> ${entry.bp ? `<span>(${entry.bp})</span>` : ''}
      <p>${entry.note || ''}</p>
      <div>
        ${(entry.tags || []).map(t => `<span class="tag">${t}</span>`).join(' ')}
      </div>
      <small>${new Date(entry.time).toLocaleString()}</small>
      <button type="button" class="removeEntryBtn" aria-label="${t('delete')}" title="${t('delete')}">×</button>
    `;
    li.querySelector('.removeEntryBtn').onclick = () => removeEntry(entries.length - idx - 1);
    ul.appendChild(li);
  });
}

function renderChart() {
  const ctx = $('#emotionChart');
  if (!window.Chart) return;
  const emotionCount = {};
  entries.forEach(e => {
    emotionCount[e.emotion] = (emotionCount[e.emotion] || 0) + 1;
  });
  if (window.emotionChartInstance) window.emotionChartInstance.destroy();
  window.emotionChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(emotionCount),
      datasets: [{
        label: t('emotion'),
        data: Object.values(emotionCount),
        backgroundColor: Object.keys(emotionCount).map(() => "#4a90e2")
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } }
    }
  });
}

function showToast(msg, error = false) {
  const toast = $('#toast');
  toast.textContent = msg;
  toast.className = 'show';
  toast.style.background = error ? 'var(--error)' : 'var(--primary)';
  setTimeout(() => { toast.className = ''; }, 2200);
}

function saveData() {
  localStorage.setItem('emotions', JSON.stringify(emotions));
  localStorage.setItem('tags', JSON.stringify(tags));
  localStorage.setItem('entries', JSON.stringify(entries));
  localStorage.setItem('theme', JSON.stringify(customTheme));
}

function addTag() {
  const val = $('#tagInput').value.trim();
  if (val && !tags.includes(val)) {
    tags.push(val);
    saveData();
    renderTags();
    showToast(t('tagAdded'));
    $('#tagInput').value = '';
  }
}

function removeTag(idx) {
  tags.splice(idx, 1);
  saveData();
  renderTags();
  showToast(t('tagDeleted'));
}

function addEmotion() {
  const val = prompt(t('addCustomEmotion'));
  if (val && !emotions.includes(val)) {
    emotions.push(val);
    saveData();
    renderEmotions();
    showToast(t('emotionAdded'));
  } else if (emotions.includes(val)) {
    showToast(t('emotionExists'), true);
  }
}

function addEntry(e) {
  e.preventDefault();
  const emotion = $('#emotionSelect').value;
  const note = $('#noteInput').value.slice(0, 250);
  const selectedTags = tags.slice();
  const bp = $('#bpInput').value.trim();
  let valid = true;
  $('#bpInput').setAttribute('aria-invalid', "false");
  if (bp && !/^(\d{2,3})\/(\d{2,3})$/.test(bp)) {
    showToast(t('invalidBP'), true);
    $('#bpInput').setAttribute('aria-invalid', "true");
    valid = false;
  }
  if (!valid) return;
  entries.push({ emotion, note, tags: selectedTags, bp, time: Date.now() });
  saveData();
  renderEntries();
  renderChart();
  showToast(t('entrySaved'));
  $('#noteInput').value = '';
  $('#bpInput').value = '';
}

function removeEntry(idx) {
  entries.splice(idx, 1);
  saveData();
  renderEntries();
  renderChart();
  showToast(t('entryDeleted'));
}

function exportData() {
  const blob = new Blob([JSON.stringify({ entries, tags, emotions })], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "emotional-wellness-data.json";
  a.click();
  URL.revokeObjectURL(url);
  showToast(t('exportSuccess'));
}

function importData(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const data = JSON.parse(evt.target.result);
      if (data.entries) entries = data.entries;
      if (data.tags) tags = data.tags;
      if (data.emotions) emotions = data.emotions;
      saveData();
      renderTags();
      renderEmotions();
      renderEntries();
      renderChart();
      showToast(t('importSuccess'));
    } catch {
      showToast(t('error'), true);
    }
  };
  reader.readAsText(file);
}

// Theme toggle
function setTheme(t) {
  customTheme = t;
  localStorage.setItem('theme', JSON.stringify(t));
  if (t === "dark") document.body.classList.add('dark');
  else if (t === "light") document.body.classList.remove('dark');
  else if (window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.body.classList.add('dark');
  else
    document.body.classList.remove('dark');
}

function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
  }
}

// PWA Install
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  $('#installBtn').hidden = false;
});

$('#installBtn').addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === "accepted") showToast(t('installSuccess'));
  else showToast(t('installDismissed'));
  deferredPrompt = null;
  $('#installBtn').hidden = true;
});

// INIT
document.addEventListener('DOMContentLoaded', () => {
  $('#langSelect').value = lang;
  $('#langSelect').onchange = (e) => setLang(e.target.value);

  $('#themeToggle').textContent = '🌗';
  $('#themeToggle').onclick = () => {
    const isDark = document.body.classList.toggle('dark');
    setTheme(isDark ? "dark" : "light");
    $('#themeToggle').setAttribute('aria-pressed', isDark);
  };
  setTheme(customTheme);

  renderEmotions();
  renderTags();
  renderEntries();
  renderChart();
  updateTexts();

  $('#addTagBtn').onclick = addTag;
  $('#addEmotionBtn').onclick = addEmotion;
  $('#entryForm').onsubmit = addEntry;
  $('#exportBtn').onclick = exportData;
  $('#importBtn').onclick = () => $('#importFile').click();
  $('#importFile').onchange = importData;

  registerSW();
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (customTheme === "auto") setTheme("auto");
  });
});
