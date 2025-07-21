const CACHE = 'smart-emotion-tracker-and-journal-cache-v1';
const ASSETS = ['index.html','manifest.json', 'icons/icon-192.png','icons/icon-512.png'];
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// Default route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Health check route
app.get("/ping", (req, res) => {
  res.send("Server is alive 🧠✨");
});

// Start server
app.listen(PORT, () => {
  console.log(`Smart Emotion Tracker and Journal running on http://localhost:${PORT}`);
});
