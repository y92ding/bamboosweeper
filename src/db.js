var MongoClient = require('mongodb').MongoClient;
// var url = "mongodb://yue:bamboosweeper@52.37.38.10/bamboosweeper-db";
var url = 'mongodb://yue@ec2-52-37-38-10.us-west-2.compute.amazonaws.com:27017';

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  //Create a collection name "customers":
  console.log("connected");
});
