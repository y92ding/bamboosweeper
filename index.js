const express = require('express');
const app = express();
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const mongoUrl = 'mongodb://yue:bamboosweeper@34.217.108.240:27017/bamboosweeper-db';

app.listen('8080');

app.use(express.json());
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
    collection.find({}, {_id: false}).sort({time:1}).toArray((err, result) => {
      if (err) {
        console.error(err);
      }
      res.send(result);
      db.close();
    });
  });
});

app.post('/won', (req, res) => {
  MongoClient.connect(mongoUrl, (err, db) => {
    if (err) {
      console.error(err);
    }
    var collection = db.db('bamboosweeper-db').collection('rankings');
    // temporary fix for duplicate insertion bug
    collection.countDocuments({name: req.body.name, time: req.body.time},
        {limit: 1}, (err, result) => {
      if (err) {
        console.error(err);
      }
      if (result == 0) {
        console.log("inserting");
        collection.insert({name: req.body.name, time: req.body.time});
        setTimeout(() => {
          collection.findOne({name: req.body.name, time: req.body.time},
              function(err, item) {
            if (err || req.body.name !== item.name || req.body.time !== item.time) {
              console.error("Insert failed. " + err);
            }
            db.close();
          })
        }, 100);
      } else {
        console.error("Attempting to insert duplicate record...");
      }
    });
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'bamboosweeper-frontend/build/index.html'));
});
