const emotions = {
  red: ["Enraged", "Furious", "Panicked", "Stressed", "Irritated", "Annoyed", "Tense", "Worried", "Fuming", "Nervous"],
  yellow: ["Exhilarated", "Ecstatic", "Upbeat", "Inspired", "Motivated", "Elated", "Thrilled", "Hopeful", "Playful", "Happy"],
  blue: ["Depressed", "Lonely", "Disheartened", "Tired", "Fatigued", "Sullen", "Hopeless", "Bored", "Spent", "Glum"],
  green: ["Relaxed", "Chill", "Serene", "Content", "Loving", "Grateful", "Comfortable", "Balanced", "Peaceful", "Mellow"]
};

const quadrantSelect = document.getElementById('quadrant');
const emotionSelect = document.getElementById('emotion');
const moodForm = document.getElementById('moodForm');
const logList = document.getElementById('logList');

quadrantSelect.addEventListener('change', () => {
  const selected = quadrantSelect.value;
  emotionSelect.innerHTML = '<option value="">--Select Emotion--</option>';
  if (emotions[selected]) {
    emotions[selected].forEach(em => {
      const opt = document.createElement('option');
      opt.value = em;
      opt.textContent = em;
      emotionSelect.appendChild(opt);
    });
  }
});

moodForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const quadrant = quadrantSelect.value;
  const emotion = emotionSelect.value;
  const intensity = document.getElementById('intensity').value;
  const note = document.getElementById('note').value;

  const prompt = getPrompt(quadrant);

  const entry = document.createElement('li');
  entry.innerHTML = `
    <strong>${new Date().toLocaleString()}</strong><br/>
    Mood: <em>${emotion}</em> (${quadrant}, ${intensity})<br/>
    Note: ${note || 'No note provided.'}<br/>
    📝 Prompt: "${prompt}"
  `;
  logList.appendChild(entry);
  moodForm.reset();
  emotionSelect.innerHTML = '<option value="">--Choose Quadrant First--</option>';
});

function getPrompt(q) {
  switch (q) {
    case 'red': return "What would help you release this tension healthily?";
    case 'yellow': return "What fueled your energy today—and how can you sustain it?";
    case 'blue': return "Is there one small thing that could lift your mood tomorrow?";
    case 'green': return "What moments of peace or gratitude stood out today?";
    default: return "";
  }
}
