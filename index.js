const express = require('express');
const app = express();
const path = require('path');

app.listen('8080');

app.use(express.static(path.join(__dirname,'bamboosweeper-frontend/build')));

app.get('/testing', (req, res) => {
  res.send("Hello world!");
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'bamboosweeper-frontend/build/index.html'));
});
