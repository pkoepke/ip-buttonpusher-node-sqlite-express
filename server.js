// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();
const Sequelize = require('sequelize');
const webPush = require('web-push'); // https://www.npmjs.com/package/web-push

// listen for requests
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

// Routing requests
// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get('/storeip', function (request, response) {
  let newIp = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
  newIp = newIp.substr(0, newIp.indexOf(',')); // Remove commas since x-forwarded-for often has several commas. Value before the first comma seems to be the original IP.
  let newDatetime = new Date();
  newDatetime = newDatetime.toString;
  console.log(newDatetime);
  myDatabase.create({ ip: newIp, datetime: newDatetime});
  let responseObject = { url: '/storeip' };
  responseObject.ipsArray = []
  myDatabase.findAll( {
    limit: 1,
    order: [['datetimeCreated', 'DESC']] // DESC aka descending starts with the most recent entry, so it returns the IP addresses in the order we want them (newest first).
  }).then(function(entries) {
    entries.forEach(function(entry) {
      responseObject.ipsArray.push([entry.ip,entry.datetimeCreated]); // Changed .unshift to .push now that the entries are sorted in the order we want them (newest first).
    });
    response.send(responseObject); // Implicitly serializes the object so calling JSON.stringify(object) isn't necessary.
  });
});

app.get('/showlasttenaddresses', function (request, response) {
  let responseObject = { url: '/showlasttenaddresses' };
  responseObject.ipsArray = []
  myDatabase.findAll( {
    limit: 10,
    order: [['datetimeCreated', 'DESC']] // DESC aka descending starts with the most recent entry, so it returns the IP addresses in the order we want them (newest first).
  }).then(function(entries) {
    entries.forEach(function(entry) {
      responseObject.ipsArray.push([entry.ip,entry.datetimeCreated]); // Changed .unshift to .push now that the entries are sorted in the order we want them (newest first).
    });
    response.send(responseObject); // Implicitly serializes the object so calling JSON.stringify(object) isn't necessary.
  });
});

app.get('/showalladdresses', function (request, response) {
  let responseObject = {};
  responseObject.url = '/showalladdresses'
  responseObject.ipsArray = []
  myDatabase.findAll( {
    order: [['datetimeCreated', 'DESC']] // DESC aka descending starts with the most recent entry, so it returns the IP addresses in the order we want them (newest first).
  } ).then(function(entries) {
    entries.forEach(function(entry) {
      responseObject.ipsArray.push([entry.ip,entry.datetimeCreated]); // Changed .unshift to .push now that the entries are sorted in the order we want them (newest first).
    });
    response.send(responseObject); // Implicitly serializes the object so calling JSON.stringify(object) isn't necessary.
  });
});

app.get('/countEntries', function (request, response) {
  let responseObject = {};
  responseObject.count = 0;
  myDatabase.count().then(function(count) {
    responseObject.count = count;
    response.send(responseObject); // Implicitly serializes the object so calling JSON.stringify(object) isn't necessary.
  });
});

// Handle Push notifications



// Database code with Sequelize

var myDatabase; // myDatabase will be a global variable so all functions can access it.

// setup a new database
// using database credentials set in .env
var sequelize = new Sequelize('database', process.env.DB_USER, process.env.DB_PASS, {
  host: '0.0.0.0',
  dialect: 'sqlite',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
    // Security note: the database is saved to the file `database.sqlite` on the local filesystem. It's deliberately placed in the `.data` directory
    // which doesn't get copied if someone remixes the project.
  storage: '.data/database.sqlite'
});

// Open the DB connection and authenticate with the database when the script runs
sequelize.authenticate()
  .then(function(err) {
    console.log('Connection has been established successfully.');
    // define a new table 'table1'
    myDatabase = sequelize.define('table1', {
      ip: {
        type: Sequelize.STRING
      },
      datetimeCreated: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
    
    // Careful, this will drop the database and make a new one! setupDb();
  })
  .catch(function (err) {
    console.log('Unable to connect to the database: ', err);
  });

// populate table with default values. Just for testing, won't be called in production code because it wipes out the previous DB and starts a new one.
function setupDb(){
  myDatabase.sync({force: true}) // using 'force' it drops the table users if it already exists, and creates a new one
    .then(function(){
      myDatabase.create({ ip: '127.0.0.1', datetime: new Date()});
    });  
}

// Web Push Notifications code

// var webPush = require('web-push'); // Handled above.

app.get('/sendNotification', function (request, response) {
  webPush.setGCMAPIKey(process.env.GCM_API_KEY);

  module.exports = function(app, route) {
    app.post(route + 'register', function(req, res) {
 
      res.sendStatus(201);
    });

    app.post(route + 'sendNotification', function(req, res) {
      setTimeout(function() {
        webPush.sendNotification({
          endpoint: req.query.endpoint,
          TTL: req.query.ttl,
        })
        .then(function() {
          res.sendStatus(201);
        })
        .catch(function(error) {
          res.sendStatus(500);
          console.log(error);
        });
      }, req.query.delay * 1000);
    });
  }
});