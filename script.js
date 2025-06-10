// ---- Accessibility and Theme/Language Controls ----
document.addEventListener('DOMContentLoaded', function() {
  // Theme selection and persistence
  const themeSelect = document.getElementById('themeSelect');
  const savedTheme = localStorage.getItem('ewt_theme');
  if (savedTheme) {
    themeSelect.value = savedTheme;
    document.body.classList.add(savedTheme);
  }
  themeSelect.addEventListener('change', function() {
    document.body.className = document.body.className.replace(/theme-\w+/g, '').trim();
    if (this.value) document.body.classList.add(this.value);
    localStorage.setItem('ewt_theme', this.value);
    showToast('Theme changed');
  });
  // Live preview of themes
  themeSelect.addEventListener('mouseover', function(e) {
    if (e.target.tagName === 'OPTION' && e.target.value)
      document.body.classList.add(e.target.value);
  });
  themeSelect.addEventListener('mouseout', function(e) {
    if (e.target.tagName === 'OPTION' && e.target.value)
      document.body.classList.remove(e.target.value);
  });

  // Dark mode toggle
  const darkToggle = document.getElementById('darkToggle');
  darkToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    darkToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    localStorage.setItem('ewt_dark', isDark ? '1' : '');
    showToast('Dark mode ' + (isDark ? 'enabled' : 'disabled'));
  });
  if (localStorage.getItem('ewt_dark')) document.body.classList.add('dark-mode');

  // Language selection (placeholder)
  const langSelect = document.getElementById('langSelect');
  langSelect.addEventListener('change', function() {
    // TODO: Integrate an i18n library or your translations here
    showToast('Language switched: ' + langSelect.options[langSelect.selectedIndex].text);
  });

  // Keyboard Accessibility: Ensure tabindex
  document.querySelectorAll('button, [tabindex="0"], input, select, textarea').forEach(el => {
    el.setAttribute('tabindex', '0');
  });

  // Initialize core UI
  renderTags();
  drawEmotionWheel();
  renderEntries();
  renderTrendLineChart();

  // Form validation
  document.getElementById('track-form').addEventListener('submit', function(e) {
    e.preventDefault();
    let valid = true;
    const bp = document.getElementById('bp');
    const weight = document.getElementById('weight');
    // BP format: 120/80
    if (!/^\d{2,3}\/\d{2,3}$/.test(bp.value)) {
      valid = false;
      showToast('Blood pressure must be in format 120/80.', true);
      bp.setAttribute('aria-invalid', 'true');
      bp.focus();
    } else {
      bp.setAttribute('aria-invalid', 'false');
    }
    if (weight.value < 10 || weight.value > 300) {
      valid = false;
      showToast('Weight must be between 10 and 300 kg.', true);
      weight.setAttribute('aria-invalid', 'true');
      weight.focus();
    } else {
      weight.setAttribute('aria-invalid', 'false');
    }
    if (valid) {
      // Save entry
      saveEntry();
    }
  });
});

// ---- Toast feedback ----
function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.style.background = isError ? '#e74c3c' : '#2ecc71';
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 3500);
}

// ---- Export/Import/Cloud Sync ----
async function importDataFile(input) {
  const file = input.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    const previewContainer = document.getElementById('importPreviewContainer');
    previewContainer.innerHTML = `
      <div class="import-preview">
        <h3>Preview Import Data</h3>
        <pre style="max-height:200px;overflow:auto;background:#eee">${JSON.stringify(data, null, 2)}</pre>
        <button id="confirmImportBtn">Confirm Import</button>
        <button id="cancelImportBtn">Cancel</button>
      </div>
    `;
    document.getElementById('confirmImportBtn').onclick = () => {
      if (data.emotions) localStorage.setItem('emotions', data.emotions);
      if (data.emotionsList) localStorage.setItem('emotionsList', data.emotionsList);
      if (data.activityTags) localStorage.setItem('activityTags', data.activityTags);
      renderTags();
      drawEmotionWheel();
      renderEntries();
      renderTrendLineChart();
      showToast("Data imported!");
      previewContainer.innerHTML = '';
    };
    document.getElementById('cancelImportBtn').onclick = () => previewContainer.innerHTML = '';
  } catch (err) {
    showToast("Invalid import file.", true);
  }
}

function exportData() {
  const data = {
    emotions: localStorage.getItem('emotions') || "[]",
    emotionsList: localStorage.getItem('emotionsList') || "[]",
    activityTags: localStorage.getItem('activityTags') || "[]"
  };
  const blob = new Blob([JSON.stringify(data)], {type: "application/json"});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = "emotional-wellness-data.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast("Data exported!");
}

function syncCloud() {
  // Placeholder for cloud sync logic (Google Drive API, Dropbox API, etc.)
  showToast("Cloud sync coming soon!");
}

// ---- Entries and Tags ----
function saveEntry() {
  const bp = document.getElementById('bp').value;
  const weight = document.getElementById('weight').value;
  const thoughts = document.getElementById('thoughts').value;
  const emotion = document.getElementById('selected-emotion').textContent || "Neutral";
  const physical = document.querySelector('.hearts .heart[aria-selected="true"]')?.getAttribute('aria-label') || "Average";
  const date = new Date().toISOString().substr(0, 10);

  let emotions = JSON.parse(localStorage.getItem('emotions') || "[]");
  emotions.push({date, emotion, physical, bp, weight, thoughts});
  localStorage.setItem('emotions', JSON.stringify(emotions));
  renderEntries();
  renderTrendLineChart();
  showToast("Entry logged!");
}

function renderEntries() {
  const entries = JSON.parse(localStorage.getItem('emotions') || "[]");
  const list = document.getElementById('emotionList');
  if (!list) return;
  list.innerHTML = '';
  entries.slice(-20).reverse().forEach(entry => {
    const li = document.createElement('li');
    li.innerHTML = `<b>${entry.date}</b>: <span>${entry.emotion}</span>
      <small style="color:#888;">[BP: ${entry.bp}, Wt: ${entry.weight}kg, Phys: ${entry.physical}]</small>
      <span style="flex:1"></span>
      <em style="color:#555;">${entry.thoughts || ''}</em>`;
    list.appendChild(li);
  });
}

function renderTags() {
  const tagData = JSON.parse(localStorage.getItem('activityTags') || "[]");
  const tagBox = document.getElementById('activity-tags');
  if (!tagBox) return;
  tagBox.innerHTML = '';
  tagData.forEach(tag => {
    const span = document.createElement('span');
    span.className = 'tag';
    span.textContent = tag;
    span.tabIndex = 0;
    span.setAttribute('role', 'option');
    span.setAttribute('aria-label', tag);
    tagBox.appendChild(span);
  });
}

function addActivityTag() {
  const input = document.getElementById('newTagName');
  const value = input.value.trim();
  if (!value) return;
  let tagData = JSON.parse(localStorage.getItem('activityTags') || "[]");
  if (!tagData.includes(value)) {
    tagData.push(value);
    localStorage.setItem('activityTags', JSON.stringify(tagData));
    renderTags();
    showToast('Activity tag added!');
  }
  input.value = '';
}

// ---- Emotion Wheel ----
function drawEmotionWheel() {
  const svg = document.getElementById('emotion-wheel');
  if (!svg) return;
  svg.innerHTML = ''; // Clear previous
  // Example wheel with 5 emotions
  const emotions = [
    { label: 'Very sad', color: '#8e44ad' },
    { label: 'Sad', color: '#3498db' },
    { label: 'Neutral', color: '#f1c40f' },
    { label: 'Happy', color: '#2ecc71' },
    { label: 'Very happy', color: '#e67e22' }
  ];
  const radius = 140, cx = 160, cy = 160;
  const angle = 2 * Math.PI / emotions.length;
  emotions.forEach((emo, i) => {
    const start = angle * i;
    const end = angle * (i + 1);
    const x1 = cx + radius * Math.cos(start);
    const y1 = cy + radius * Math.sin(start);
    const x2 = cx + radius * Math.cos(end);
    const y2 = cy + radius * Math.sin(end);
    const largeArcFlag = angle > Math.PI ? 1 : 0;
    const d = `
      M ${cx} ${cy}
      L ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
      Z
    `;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', emo.color);
    path.setAttribute('tabindex', '0');
    path.setAttribute('aria-label', emo.label);
    path.setAttribute('role', 'option');
    path.addEventListener('click', () => selectEmotion(emo.label, emo.color));
    path.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') selectEmotion(emo.label, emo.color);
    });
    svg.appendChild(path);
    // Add emotion label
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    const tx = cx + (radius - 40) * Math.cos(start + angle / 2);
    const ty = cy + (radius - 40) * Math.sin(start + angle / 2);
    text.setAttribute('x', tx);
    text.setAttribute('y', ty);
    text.setAttribute('fill', '#23272f');
    text.setAttribute('font-size', '1.1em');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('alignment-baseline', 'central');
    text.textContent = emo.label;
    svg.appendChild(text);
  });
}
function selectEmotion(label, color) {
  const sel = document.getElementById('selected-emotion');
  sel.textContent = label;
  sel.style.color = color;
  showToast('Emotion selected: ' + label);
}

// ---- Mood Trend Chart ----
function renderTrendLineChart() {
  if (!window.Chart) return;
  const ctx = document.getElementById('emotionTrendChart').getContext('2d');
  const emotions = JSON.parse(localStorage.getItem('emotions') || "[]");
  const moodOrder = ["Very sad", "Sad", "Neutral", "Happy", "Very happy"];
  const dateMap = {};
  emotions.forEach(entry => {
    if (!dateMap[entry.date]) dateMap[entry.date] = [];
    dateMap[entry.date].push(entry.emotion);
  });
  const labels = Object.keys(dateMap).sort();
  const data = labels.map(date => {
    const moods = dateMap[date];
    if (!moods.length) return null;
    const avg = moods.map(m => moodOrder.indexOf(m)).reduce((a, b) => a + b, 0) / moods.length;
    return avg;
  });
  if (window.emotionTrendChartObj) window.emotionTrendChartObj.destroy();
  window.emotionTrendChartObj = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Average Mood',
        data,
        borderColor: '#3e95cd',
        fill: false,
        tension: 0.2,
        pointBackgroundColor: '#fff',
        pointRadius: 4,
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: 'Mood Trends Over Time' },
        tooltip: { enabled: true },
      },
      scales: {
        y: {
          min: 0,
          max: moodOrder.length - 1,
          ticks: {
            callback: value => moodOrder[value] || ''
          }
        }
      },
      interaction: {
        mode: 'nearest',
        intersect: false
      }
    }
  });
}

function zoomChart(direction) {
  if (!window.emotionTrendChartObj) return;
  let yScale = window.emotionTrendChartObj.options.scales.y;
  if (direction === 'in') {
    yScale.max = Math.max(1, yScale.max - 1);
    yScale.min = Math.min(yScale.max - 1, yScale.min + 1);
  } else if (direction === 'out') {
    yScale.max += 1;
    yScale.min = Math.max(0, yScale.min - 1);
  } else if (direction === 'reset') {
    yScale.min = 0;
    yScale.max = 4;
  }
  window.emotionTrendChartObj.update();
}

// ---- Add Emotion ----
function addEmotion() {
  const nameInput = document.getElementById('newEmotionName');
  const colorInput = document.getElementById('newEmotionColor');
  const name = nameInput.value.trim();
  const color = colorInput.value;
  if (!name) {
    showToast('Emotion name required.', true);
    return;
  }
  let emotionsList = JSON.parse(localStorage.getItem('emotionsList') || "[]");
  if (!emotionsList.find(e => e.name === name)) {
    emotionsList.push({ name, color });
    localStorage.setItem('emotionsList', JSON.stringify(emotionsList));
    showToast('New emotion added!');
    drawEmotionWheel();
  } else {
    showToast('Emotion already exists.', true);
  }
  nameInput.value = '';
  colorInput.value = '#888888';
}
