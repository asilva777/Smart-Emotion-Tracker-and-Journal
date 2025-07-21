// EMOTION DATA – 36 per quadrant
const emotions = {
  red: [
    "Enraged", "Furious", "Panicked", "Stressed", "Jittery", "Agitated", "Annoyed", "Irritated", "Tense",
    "Worried", "Apprehensive", "Alarmed", "Fuming", "Frustrated", "Angry", "Resentful", "Hostile", "Disgusted",
    "Mad", "Upset", "Shocked", "Frightened", "Stunned", "Jealous", "Defensive", "Paranoid", "Pained", "Disturbed",
    "Embarrassed", "Ashamed", "Insecure", "Helpless", "Overwhelmed", "Outraged", "Anxious", "Impatient"
  ],
  yellow: [
    "Exhilarated", "Ecstatic", "Excited", "Upbeat", "Joyful", "Cheerful", "Inspired", "Motivated", "Elated",
    "Thrilled", "Proud", "Hopeful", "Lively", "Playful", "Happy", "Grinning", "Bubbly", "Contented",
    "Energetic", "Driven", "Focused", "Eager", "Spirited", "Confident", "Empowered", "Determined", "Brave",
    "Optimistic", "Amused", "Lighthearted", "Affectionate", "Curious", "Alert", "Spunky", "Dynamic", "Vibrant"
  ],
  blue: [
    "Depressed", "Miserable", "Lonely", "Disheartened", "Alienated", "Sad", "Tired", "Fatigued", "Sullen",
    "Despondent", "Hopeless", "Bored", "Glum", "Spent", "Discouraged", "Withdrawn", "Grieving", "Abandoned",
    "Worn out", "Confused", "Doubtful", "Apathetic", "Regretful", "Disappointed", "Hurt", "Unfulfilled", "Melancholy",
    "Demotivated", "Inadequate", "Lost", "Slack", "Blue", "Low", "Empty", "Blank", "Forlorn"
  ],
  green: [
    "Relaxed", "Chill", "Restful", "Serene", "Tranquil", "Content", "Fulfilled", "Loving", "Grateful",
    "Touched", "Comfortable", "Balanced", "Mellow", "Peaceful", "Nurtured", "Centered", "Safe", "Grounded",
    "Trusting", "Connected", "Accepted", "Kind", "Compassionate", "Gentle", "Carefree", "Open", "At ease",
    "Warm", "Supportive", "Calm", "Receptive", "Affirmed", "Unburdened", "Still", "Reflective", "Soft"
  ]
};

// DOM Elements
const quadrantSelect = document.getElementById("quadrant");
const emotionSelect = document.getElementById("emotion");
const moodForm = document.getElementById("moodForm");
const logList = document.getElementById("logList");

// Load emotion options based on quadrant
quadrantSelect.addEventListener("change", () => {
  const selected = quadrantSelect.value;
  emotionSelect.innerHTML = '<option value="">--Select Emotion--</option>';
  if (emotions[selected]) {
    emotions[selected].forEach(em => {
      const opt = document.createElement("option");
      opt.value = em;
      opt.textContent = em;
      emotionSelect.appendChild(opt);
    });
  }
});

// Journal Entry Logic
moodForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const quadrant = quadrantSelect.value;
  const emotion = emotionSelect.value;
  const intensity = document.getElementById("intensity").value;
  const tag = document.getElementById("tag").value;
  const context = document.getElementById("context").value;
  const trigger = document.getElementById("trigger").value;
  const note = document.getElementById("note").value;
  const prompt = getPrompt(quadrant);

  const entry = document.createElement("li");
  entry.innerHTML = `
    <strong>${new Date().toLocaleString()}</strong><br/>
    🔹 Quadrant: ${quadrant.toUpperCase()}<br/>
    💬 Emotion: <em>${emotion}</em> (${intensity})<br/>
    🏷️ Activity: ${tag}<br/>
    📍 Context: ${context || "—"}<br/>
    🚧 Trigger: ${trigger || "—"}<br/>
    📝 Reflection: ${note || "—"}<br/>
    💡 Prompt: "${prompt}"
  `;
  logList.appendChild(entry);
  moodForm.reset();
  emotionSelect.innerHTML = '<option value="">--Select Emotion--</option>';
});

// Prompts by quadrant
function getPrompt(q) {
  switch (q) {
    case "red": return "What would help you release this tension healthily?";
    case "yellow": return "What fueled your energy today—and how can you sustain it?";
    case "blue": return "Is there one small thing that could lift your mood tomorrow?";
    case "green": return "What moments of peace or gratitude stood out today?";
    default: return "Reflect on your emotional journey.";
  }
}

// Chart.js Integration
const ctx = document.getElementById("moodChart").getContext("2d");

const moodChart = new Chart(ctx, {
  type: "bar",
  data: {
    labels: ["Jul 1", "Jul 5", "Jul 9", "Jul 13", "Jul 17", "Jul 21", "Jul 25", "Jul 29"],
    datasets: [
      {
        label: "Red",
        data: [3, 2, 4, 1, 2, 3, 2, 3],
        backgroundColor: "#e53935"
      },
      {
        label: "Blue",
        data: [2, 3, 1, 3, 2, 4, 3, 2],
        backgroundColor: "#1e88e5"
      },
      {
        label: "Yellow",
        data: [1, 4, 2, 3, 4, 2, 1, 3],
        backgroundColor: "#fdd835"
      },
      {
        label: "Green",
        data: [2, 1, 3, 2, 1, 2, 4, 2],
        backgroundColor: "#43a047"
      }
    ]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom"
      },
      title: {
        display: true,
        text: "Mood Quadrant Trends – July"
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Entries" }
      },
      x: {
        title: { display: true, text: "Date" }
      }
    }
  }
});

// Service Worker Registration
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then(reg => console.log("Service Worker registered!", reg))
      .catch(err => console.error("Service Worker error:", err));
  });
}
