const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(express.json());
const DB = path.join(__dirname, 'research.json');

app.post('/api/research', (req, res) => {
  const entries = fs.existsSync(DB) ? JSON.parse(fs.readFileSync(DB)) : [];
  entries.push(req.body);
  fs.writeFileSync(DB, JSON.stringify(entries, null, 2));
  res.json({status: 'ok'});
});

app.get('/api/research', (req, res) => {
  const entries = fs.existsSync(DB) ? JSON.parse(fs.readFileSync(DB)) : [];
  res.json(entries);
});

const port = process.env.PORT||5000;
app.listen(port, ()=>console.log(`Server running on port ${port}`));
