const express = require('express');
const app = express();
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
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
    cs: 'students',
  })
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'bamboosweeper-frontend/build/index.html'));
});

const url = "mongodb://yue:bamboosweeper@34.210.60.116:27017/bamboosweeper-db";
MongoClient.connect(url, (err, db) => {
  if (err) throw err;
  console.log("Database connected!");
  db.close();
}); 

