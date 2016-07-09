var express = require('express');
var ParseServer = require('parse-server').ParseServer;

var path = require('path');

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://aws-user:1A2Z3E4R5T6Y7U8I9O0P@SG-SharedNews-7652.servers.mongodirector.com:27017/production',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'com.sinenco.sharednews',
  masterKey: process.env.MASTER_KEY || 'VXjY3oIWK9VE5YnU3zzKVZ4GEDV9QYqPi7VFT3Ds',
  allowClientClassCreation: false,
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',
  push: {
      android: {
        senderId: '1015289772776',
        apiKey: 'AIzaSyCk5eDARZR-UwmPxW0OnALngJTLguDvUJk'
      },
      ios: [{
        pfx: __dirname + '/conf/push/ios/prod.p12',
        passphrase: '', 
        bundleId: 'com.sinenco.sharednews',
        production: true
      },{
        pfx: __dirname + '/conf/push/ios/dev.p12',
        passphrase: '', 
        bundleId: 'com.sinenco.sharednews',
        production: false
      }]
    }
});

var app = express();

// Serve static assets from the /public folder

app.use('/', express.static(path.join(__dirname, '/public/landing')));
app.use('/app', express.static(path.join(__dirname, '/public/app')));
app.use('/dashboard', express.static(path.join(__dirname, '/public/dashboard')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);


// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});
