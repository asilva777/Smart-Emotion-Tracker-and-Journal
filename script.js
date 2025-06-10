// ------------- Theme and Dark Mode -------------
document.addEventListener('DOMContentLoaded', function() {
  // Theme initialization
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
  });

  // Dark mode toggle
  const darkToggle = document.getElementById('darkToggle');
  darkToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    darkToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    localStorage.setItem('ewt_dark', isDark ? '1' : '');
  });
  if (localStorage.getItem('ewt_dark')) document.body.classList.add('dark-mode');
});

// ------------- Activity Tags -------------
const defaultTags = ["Sleep", "Workout", "Meal", "Work", "Headache", "Stressed", "Relaxing", "Social", "Other"];
function loadTags() {
  return JSON.parse(localStorage.getItem('activityTags')) || defaultTags;
}
function saveTags(tags) {
  localStorage.setItem('activityTags', JSON.stringify(tags));
}
function sanitize(str) {
  const el = document.createElement('div');
  el.innerText = str;
  return el.innerHTML.trim();
}
function renderTags() {
  const tagBox = document.getElementById('activity-tags');
  tagBox.innerHTML = '';
  loadTags().forEach(tag => {
    const div = document.createElement('div');
    div.className = 'tag';
    div.setAttribute('role', 'option');
    div.setAttribute('tabindex', '0');
    div.textContent = tag;
    div.onclick = () => div.classList.toggle('selected');
    div.onkeydown = e => { if (e.key === ' ' || e.key === 'Enter') div.classList.toggle('selected'); };
    tagBox.appendChild(div);
  });
}
function addActivityTag() {
  const inp = document.getElementById('newTagName');
  let tag = sanitize(inp.value.trim());
  if (!tag) return;
  let tags = loadTags();
  if (tags.map(t => t.toLowerCase()).includes(tag.toLowerCase())) { inp.value=''; return; }
  tags.push(tag);
  saveTags(tags);
  inp.value = '';
  renderTags();
}

// ------------- Emotions -------------
const defaultEmotions = [
  { name: 'Happy', color: '#FFD700' },
  { name: 'Sad', color: '#1E90FF' },
  { name: 'Angry', color: '#FF6347' },
  { name: 'Calm', color: '#32CD32' },
  { name: 'Anxious', color: '#FFB347' },
  { name: 'Excited', color: '#E67E22' },
  { name: 'Tired', color: '#A9A9A9' },
  { name: 'Surprised', color: '#8e44ad' }
];
const svgEmotions = [
  { name: "Joy", color: "#FFE066" },
  { name: "Trust", color: "#8BC34A" },
  { name: "Fear", color: "#00BCD4" },
  { name: "Surprise", color: "#448AFF" },
  { name: "Sadness", color: "#90A4AE" },
  { name: "Disgust", color: "#9C27B0" },
  { name: "Anger", color: "#FF7043" },
  { name: "Anticipation", color: "#FFEE58" }
];
function loadEmotions() {
  return JSON.parse(localStorage.getItem('emotionsList')) || defaultEmotions;
}
function saveEmotions(emotions) {
  localStorage.setItem('emotionsList', JSON.stringify(emotions));
}
function addEmotion() {
  const nameInput = document.getElementById('newEmotionName');
  const colorInput = document.getElementById('newEmotionColor');
  const name = sanitize(nameInput.value.trim());
  const color = colorInput.value;
  if (!name) { alert('Enter an emotion name.'); return; }
  let emotions = loadEmotions();
  if (emotions.some(e => e.name.toLowerCase() === name.toLowerCase())) {
    alert('Emotion already exists.');
    return;
  }
  emotions.push({ name, color });
  saveEmotions(emotions);
  drawEmotionWheel();
  nameInput.value = '';
  colorInput.value = '#888888';
}

// ------------- Emotion Wheel -------------
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}
function describeArc(x, y, radius, startAngle, endAngle){
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const arcSweep = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", x, y,
    "L", start.x, start.y, 
    "A", radius, radius, 0, arcSweep, 0, end.x, end.y,
    "Z"
  ].join(" ");
}
let selectedEmotion = null;
function drawEmotionWheel() {
  const svg = document.getElementById('emotion-wheel');
  svg.innerHTML = '';
  const center = 160, radius = 135;
  const angleStep = 360 / svgEmotions.length;
  for (let i = 0; i < svgEmotions.length; i++) {
    const startAngle = i * angleStep;
    const endAngle = startAngle + angleStep;
    const emotion = svgEmotions[i];
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", describeArc(center, center, radius, startAngle, endAngle));
    path.setAttribute("fill", emotion.color);
    path.setAttribute("stroke", "#fff");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("data-emotion", emotion.name);
    path.setAttribute("tabindex", "0");
    path.setAttribute("role", "button");
    path.style.cursor = "pointer";
    path.addEventListener("click", onSectorClick);
    path.addEventListener("keydown", e => { if (e.key === " " || e.key === "Enter") onSectorClick({target:path}); });
    svg.appendChild(path);
    // Label
    const labelAngle = startAngle + angleStep/2;
    const labelPos = polarToCartesian(center, center, radius * 0.75, labelAngle);
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", labelPos.x);
    text.setAttribute("y", labelPos.y);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.setAttribute("font-size", "15");
    text.setAttribute("fill", "#222");
    text.textContent = emotion.name;
    svg.appendChild(text);
  }
}
function onSectorClick(evt) {
  document.querySelectorAll('#emotion-wheel path').forEach(p => p.setAttribute("stroke-width", "2"));
  evt.target.setAttribute("stroke-width", "6");
  const emotion = evt.target.getAttribute("data-emotion");
  document.getElementById('selected-emotion').textContent = "Selected: " + emotion;
  document.getElementById('selected-emotion').setAttribute("data-selected", emotion);
  selectedEmotion = emotion;
  document.getElementById('saveEmotion').disabled = false;
}

// ------------- Mood Faces and Physical Hearts -------------
function setupSelection(containerId, itemClass, multiSelect=false) {
  const items = document.querySelectorAll(`#${containerId} .${itemClass}`);
  items.forEach((item, idx) => {
    item.onclick = () => {
      if (multiSelect) {
        items.forEach((h, i) => h.classList.toggle('selected', i<=idx));
      } else {
        items.forEach(f => f.classList.remove('selected'));
        item.classList.add('selected');
      }
    };
    item.onkeydown = e => {
      if (e.key === " " || e.key === "Enter") item.click();
    };
  });
}

// ------------- Save Emotion Entry -------------
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('saveEmotion').onclick = function() {
    if (!selectedEmotion) return;
    const today = new Date().toISOString().split('T')[0];
    const entry = { date: today, emotion: selectedEmotion };
    let emotions = JSON.parse(localStorage.getItem('emotions')) || [];
    emotions.push(entry);
    localStorage.setItem('emotions', JSON.stringify(emotions));
    renderEntries();
    renderTrendLineChart();
    document.getElementById('saveEmotion').disabled = true;
    selectedEmotion = null;
    document.getElementById('selected-emotion').textContent = '';
    drawEmotionWheel();
  };
});

// ------------- Color by Emotion -------------
function getEmotionColor(emotion) {
  const emotions = loadEmotions().concat(svgEmotions);
  const found = emotions.find(e => e.name === emotion);
  return found ? found.color : '#888';
}

// ------------- Statistics and Log Entry -------------
function getMoodSymbol(idx) {
  return ["😢","🙁","😐","🙂","😃"][idx];
}
function getPhysicalLabel(idx) {
  return ["Poor","Fair","Average","Good","Excellent"][idx];
}
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('track-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const errorEl = document.getElementById('formError');
    errorEl.textContent = '';
    let bp = document.getElementById('bp').value.trim();
    let weight = document.getElementById('weight').value.trim();
    let valid = true;
    if (bp && !/^\d{2,3}\/\d{2,3}$/.test(bp)) {
      errorEl.textContent = 'Blood pressure must be in the format 120/80.';
      valid = false;
    }
    if (weight && (isNaN(weight) || Number(weight)<10 || Number(weight)>300)) {
      errorEl.textContent = 'Weight must be between 10 and 300 kg.';
      valid = false;
    }
    if (!valid) return;
    // Update stats
    let moodIdx = Array.from(document.querySelectorAll('.face')).findIndex(f => f.classList.contains('selected'));
    let physicalIdx = Array.from(document.querySelectorAll('.heart')).filter(h => h.classList.contains('selected')).length - 1;
    if(moodIdx>=0) document.getElementById('stat-mood').textContent = getMoodSymbol(moodIdx);
    if(physicalIdx>=0) document.getElementById('stat-physical').textContent = getPhysicalLabel(physicalIdx);
    document.getElementById('stat-bp').textContent = bp || "—";
    document.getElementById('stat-weight').textContent = weight ? (weight + " kg") : '—';
    // Reset form
    document.getElementById('log-entry').textContent = "Logged!";
    setTimeout(()=>document.getElementById('log-entry').textContent="Log Entry",1000);
    document.getElementById('thoughts').value = "";
    this.reset();
  });
});

// ------------- Render Entries List -------------
function renderEntries() {
  const emotions = JSON.parse(localStorage.getItem('emotions')) || [];
  const ul = document.getElementById('emotionList');
  ul.innerHTML = emotions.slice().reverse().map(e => 
    `<li><strong>${e.date}:</strong> <span style="color:${getEmotionColor(e.emotion)}">${sanitize(e.emotion)}</span></li>`
  ).join('');
}

// ------------- Improved Import/Export -------------
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
}
function importDataFile(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      // Preview data
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
        renderTags(); drawEmotionWheel(); renderEntries(); renderTrendLineChart();
        alert("Data imported!");
        previewContainer.innerHTML = '';
      };
      document.getElementById('cancelImportBtn').onclick = () => previewContainer.innerHTML = '';
    } catch {
      alert("Invalid import file.");
    }
  };
  reader.readAsText(file);
}

// ------------- Mood Trend Analytics (Line Chart) -------------
function renderTrendLineChart() {
  const ctx = document.getElementById('emotionTrendChart').getContext('2d');
  const emotions = JSON.parse(localStorage.getItem('emotions')) || [];
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
        tension: 0.2
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: 'Mood Trends Over Time' }
      },
      scales: {
        y: {
          min: 0,
          max: moodOrder.length - 1,
          ticks: {
            callback: value => moodOrder[value] || ''
          }
        }
      }
    }
  });
}

// ------------- Initial Load -------------
window.addEventListener('DOMContentLoaded', function() {
  renderTags();
  drawEmotionWheel();
  renderEntries();
  setupSelection('mood-faces', 'face');
  setupSelection('physical-hearts', 'heart', true);
  renderTrendLineChart();
});
