require('./function.check_service_owner.js');
require('./function.saveURLFile.js');
require('./function.standalone_ios_push_sender.js');
require('./function.standalone_ios_push.js');
require('./function.send_email.js');
require('./function.subscription_update.js');


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

	var user = request.user ; 
	var content = request.params.content;
	var summary = request.params.summary;

	var Message = Parse.Object.extend("Message");
  	var CloudAction = Parse.Object.extend("CloudAction");

	var message = new Message();
	message.id = request.params.messageId;

	var service = null;
  	var serviceConfiguration = null ; 
  	var cloudAction = null;

  	var counter = 0;

	var returns = {} ;

	subscription_update(returns, request.params.serviceId, user)
	.then( /* Get ServiceConfiguration object */
		function(object){
		  // Expiration - 30 minutes from now
		  var d = new Date();
		  var time = ( 1800 * 1000);
		  var expirationDate = new Date(d.getTime() - (time));
	      var query = new Parse.Query(CloudAction);
	      query.equalTo("service", returns.service);
	      query.equalTo("type","send");
	      query.greaterThanOrEqualTo("createdAt", expirationDate);
	      return query.first();
	    }
	 ).then(
	    function(object){
	    	if(typeof(object)!="undefined"){
	      		throw new Error("must wait");
	      	}
			serviceConfiguration = returns.serviceConfiguration;
			service = returns.service;
			counter = returns.counter;

			if ( parseInt(serviceConfiguration.get('messagesUsers')) < counter){
    			throw new Error("Not enough messagesUsers");
			}

			return message.fetch();
		}
	).then(
		function(object){
			if (message.get("sent") == true){
    			throw new Error();
			}
  	
			cloudAction = new CloudAction();
		    cloudAction.set("status", "pending");
	     	cloudAction.set("type","send");
		    cloudAction.set("service", returns.service);
		    cloudAction.set("user", user);

			if ( serviceConfiguration.get("iOSStandalone")){
		    	cloudAction.add("logs",{message:"send to standalone ios"});
				return standalone_ios_push(service, serviceConfiguration, message);
			}else{
				return ;
			}
		}
	).then( /* Send to iOS */
		function(object){
		    cloudAction.add("logs",{message:"send to ios"});
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
		    cloudAction.add("logs",{message:"send to android"});
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
		    var acl = new Parse.ACL();
		    acl.setPublicReadAccess(true);

		    message.set("sent", true);
  			message.set("ACL", acl);

		    return message.save();
		}
	).then( /* Change state of message */
		function() {
		    var messagesUsers = parseInt(serviceConfiguration.get('messagesUsers')) - counter;

		    serviceConfiguration.set('messagesUsers', messagesUsers);
		    return serviceConfiguration.save();
		}
	).then(
		function(object){
		    cloudAction.add("logs",{tokens:counter,message:"tokens used"});
		    cloudAction.set("status", "OK");
            return cloudAction.save(true);
		}
	).then(
		function(object){
      		success_response(request, response, 410);
		}
	).then(null, /* Catch error */
		function(error) {
      		console.log(error);
      		if (cloudAction != null){
			    cloudAction.set("status", "KO");
	            cloudAction.save(true);
	        }
	  		error_response(request,response, 410, error);
		}
	);
});

