
// End of Cloud tools
var express = require('express');
var ParseServer = require('parse-server').ParseServer;

var path = require('path');


var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}


// Tools needed in the CloudFunction 

var nodemailer = require('nodemailer');
Mail = nodemailer.createTransport({
    host:'ssl0.ovh.net',
    port:587,
    auth: {
        user: 'webmaster@sinenco.com', 
        pass: 'bullet4my04'
    }
});

// End of Cloud tools

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://aws-user:1A2Z3E4R5T6Y7U8I9O0P@SG-SharedNews-7652.servers.mongodirector.com:27017/production',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'com.sinenco.smartherald',
  masterKey: process.env.MASTER_KEY || 'VXjY3oIWK9VE5YnU3zzKVZ4GEDV9QYqPi7VFT3Ds',
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',
  push: {
      android: {
        senderId: '1058965231682',
        apiKey: 'AIzaSyDDmxAdjYhfT_si9T1D09v-DT4Z0kl64SE'
      },
      ios: [{
        pfx: __dirname + '/conf/push/ios/prod.p12',
        passphrase: 'anggun', 
        bundleId: 'com.sinenco.smartherald',
        production: true
      },{
        pfx: __dirname + '/conf/push/ios/dev.p12',
        passphrase: 'anggun', 
        bundleId: 'com.sinenco.smartherald',
        production: false
      }]
    },
  allowClientClassCreation: false,
  sessionLength:1296000 //2 weeks expiration
});

var app = express();

// Serve static assets from the /public folder
var landing_dir = path.join(process.env.public_dir || __dirname) + "/public/landing";

require(path.join(__dirname,'public/landing_paths.js'))(app, express, landing_dir);

app.use('/static', express.static(path.join(__dirname, '/public/statics')));
app.use('/app', express.static(path.join(__dirname, '/public/app')));
app.use('/dashboard', express.static(path.join(__dirname, '/public/dashboard')));
app.get('/download', function(req, res) {
  if (req.hasOwnProperty('headers')){
  	if (req.headers.hasOwnProperty('user-agent')){
	  if(req.headers['user-agent'].search('iPhone') > -1){
		res.redirect('itms-apps://itunes.apple.com/app/id1139174211');
	  }else if(req.headers['user-agent'].search('iPod') > -1){
		res.redirect('itms-apps://itunes.apple.com/app/id1139174211');
	  }else if(req.headers['user-agent'].search('iPad') > -1){
		res.redirect('itms-apps://itunes.apple.com/app/id1139174211');
	  }else if(req.headers['user-agent'].search('Android') > -1){
		res.redirect('market://details?id=com.sinenco.smartherald');
	  }else{
  		res.redirect('/app');
	  }
	  return;
  	}
  }
  res.redirect('/');
});
// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

//require("./jobs/main.js");

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
