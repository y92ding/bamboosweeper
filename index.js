const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');

app.listen('8080');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,'bamboosweeper-frontend/build')));

app.get('/testing', (req, res) => {
  res.send("Hello world!");
});

app.get('/rankings', (req, res) => {
  res.send({
    yue: 'ding',
    tony: 'zhang',
  })
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'bamboosweeper-frontend/build/index.html'));
});
