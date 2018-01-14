const express = require('express');
const app = express();
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const mongoUrl = 'mongodb://yue:bamboosweeper@34.210.60.116:27017/bamboosweeper-db';

app.listen('8080');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,'bamboosweeper-frontend/build')));

app.get('/testing', (req, res) => {
  res.send("Hello world!");
});

app.get('/rankings', (req, res) => {
  MongoClient.connect(mongoUrl, (err, db) => {
    if (err) {
      console.error(err);
    }
    var collection = db.db('bamboosweeper-db').collection('rankings');
    collection.find({}, {_id: false}).toArray((err, result) => {
      if (err) {
        console.error(err);
      }
      res.send(result);
      db.close();
    });
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'bamboosweeper-frontend/build/index.html'));
});
