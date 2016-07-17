require('./functions.js');

const saveURLFile = function(url, filename) {
  // return new pending promise
  return new Promise((resolve, reject) => {
	var fs = require('fs');
    // select http or https module, depending on reqested url
    const lib = url.startsWith('https') ? require('https') : require('http');
    const request = lib.get(url, (response) => {
	  var file = fs.createWriteStream(filename);
	  response.pipe(file);
      // handle http errors
      if (response.statusCode < 200 || response.statusCode > 299) {
         reject(new Error('Failed to load page, status code: ' + response.statusCode));
       }
      // temporary data holder
      const body = [];
      // on every content chunk, push it to the data array
      response.on('data', (chunk) => body.push(chunk));
      // we are done, resolve promise with those joined chunks
      response.on('end', () => resolve(body.join('')));
    });
    // handle connection errors of the request
    request.on('error', (err) => reject(err))
    })
};

standalone_ios_push_sender = function(options, tokens, message){
	var apn = require('apn');
	var conn = new apn.connection(options);
	/*
	conn.on("connected", function() {
	    console.log("Connected");
	});

	conn.on("transmitted", function(notification, device) {
	    console.log("Notification transmitted to:" + device.token.toString("hex"));
	});

	conn.on("transmissionError", function(errCode, notification, device) {
	    console.error("Notification caused error: " + errCode + " for device ", device, notification);
	    if (errCode === 8) {
	        console.log("A error code of 8 indicates that the device token is invalid. This could be for a number of reasons - are you using the correct environment? i.e. Production vs. Sandbox");
	    }
	});

	conn.on("timeout", function () {
	    console.log("Connection Timeout");
	});

	conn.on("disconnected", function() {
	    console.log("Disconnected from APNS");
	});

	conn.on("socketError", console.error);
	*/

    var note = new apn.notification();
    note.setAlertText(service.get("name") +": " + message.get("summary"));
    note.badge = 1;

    conn.pushNotification(note, tokens);
}

standalone_ios_push = function(service, serviceConfiguration, message){

	var tokens = [];

	var installationsQuery = new Parse.Query(Parse.Installation);
	installationsQuery.equalTo("channels", service.get("canonicalName")); // Like a contains
	installationsQuery.equalTo("deviceType", "ios"); 
	
	var options = { 
        //pfx: __dirname + '/../conf/'+serviceConfiguration.get("pushIOSDev").name(),
        //production: false,
        pfx: __dirname + '/../conf/'+serviceConfiguration.get("pushIOSProd").name(),
        production: true,
        passphrase: '', 
        bundleId: serviceConfiguration.get("iOSStandaloneBundleID"),
	    batchFeedback: true,
	    interval: 300
    };
    //return saveURLFile(serviceConfiguration.get("pushIOSDev").url(), __dirname + '/../conf/'+serviceConfiguration.get("pushIOSDev").name())
	return saveURLFile(serviceConfiguration.get("pushIOSProd").url(), __dirname + '/../conf/'+serviceConfiguration.get("pushIOSProd").name())
  		.then(
			function(object) {
		  		return installationsQuery.find();
			}
		).then(
		function(installations){
			console.log("here");

			console.log(installations);
			for (var i = 0; i < installations.length; i++) {
				console.log(installations[i].get("deviceToken"));
		      tokens.push(installations[i].get("deviceToken"));
		    }

			if(installations.length<=0) {
				return 0;
			}
			
			standalone_ios_push_sender(options, tokens, service.get("name") +": " + message.get("summary"));		
		}
	);

};


/**
 * Send the message
 * 
 * @param request.user
 * @param request.params.serviceId
 * @param request.params.messageId
 */
Parse.Cloud.define("send", function(request, response) {

if (!request.user || !request.params.messageId || !request.params.serviceId ){
	    error_response(request,response, 002);
	    return ;
	}
  	Parse.Cloud.useMasterKey();

	var step = 1 ;
	var user = request.user ; 
	var content = request.params.content;
	var summary = request.params.summary;


	var Service = Parse.Object.extend("Service");
	var service = new Service();
	service.id = request.params.serviceId;

	var Message = Parse.Object.extend("Message");
	var message = new Message();
	message.id = request.params.messageId;

	var ServicesOwners = Parse.Object.extend("ServicesOwners");
  	var servicesOwnersQuery = new Parse.Query(ServicesOwners);
  	servicesOwnersQuery.equalTo('client', user);

  	var serviceConfiguration = null ; 

	/* Check content of summary and content */

	check_service_owner(step, service, servicesOwnersQuery, serviceConfiguration).then( /* Get ServiceConfiguration object */
		function(object){
			step++;
			serviceConfiguration = object;
			/* Check expiration */
			if ( parseInt(serviceConfiguration.get('messagesUsers')) >= parseInt(serviceConfiguration.get('subscriptions'))){
				step++;
			    return message.fetch();
			}else{
  				error_response(request,response, 41+step, {message:"Not enough messagesUsers"+parseInt(serviceConfiguration.get('messagesUsers')) +parseInt(serviceConfiguration.get('subscriptions'))});
    			throw new Error("already sent");
			}
		}
	).then(
		function(object){
			if (message.get("sent") == true){
    			throw new Error();
			}

			if ( serviceConfiguration.get("iOSStandalone")){
				return standalone_ios_push(service, serviceConfiguration, message);
			}else{
				return ;
			}

		}
	).then( /* Send to iOS */
		function(object){
			step++;
			step++;
			return Parse.Push.send({
			  	where: {
				  	"channels": service.get("canonicalName"),
		            "deviceType": {
		              "$in": [
		                "ios"
		              ]
		            }
				},
			 	data: {
	            	"alert": service.get("name") +": " + message.get("summary")
			  	}
			}, { useMasterKey: true });
		}
	).then(/* Send to Android*/
		function(object){
			step++;
			return Parse.Push.send({
			  	where: {
				  	"channels": service.get("canonicalName"),
		            "deviceType": {
		              "$in": [
		                "android"
		              ]
		            }
				},
			 	data: {
			  		"title": service.get("name"),
	            	"alert": message.get("summary")
			  	}
			}, { useMasterKey: true });
		}
	).then( /* Change state of message */
		function() {
			step++;
		    var acl = new Parse.ACL();
		    acl.setPublicReadAccess(true);

		    //message.set("sent", true);
  			message.set("ACL", acl);

		    //return message.save();
		}
	).then( /* Change state of message */
		function() {
			step++;
		    var messagesUsers = parseInt(serviceConfiguration.get('messagesUsers')) - parseInt(serviceConfiguration.get('subscriptions'));
		    serviceConfiguration.set('messagesUsers', messagesUsers);
		    return serviceConfiguration.save();
		}
	).then(
		function(object){
			step++;
      		success_response(request, response, 410);
		}
	).then(null, /* Catch error */
		function(error) {
	  		error_response(request,response, 410+step, error);
		}
	);
});

