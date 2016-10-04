require('./function.build_message.js');
require('./function.send_email.js');


/**
 * Send the message
 * 
 * @param request.user
 * @param request.params.messageCreatorId
 */
Parse.Cloud.define("build_message", function(request, response) {

	if (!request.user || !request.params.messageCreatorId){
	    error_response(request,response, 002);
	    return ;
	}

	var user = request.user ; 
	var content = request.params.content;
	var summary = request.params.summary;

	var Message = Parse.Object.extend("Message");
	var MessageCreator = Parse.Object.extend("MessageCreator");
  	var CloudAction = Parse.Object.extend("CloudAction");

	var messageCreator = new MessageCreator();
	messageCreator.id = request.params.messageCreatorId;

	var service = null;
  	var serviceConfiguration = null ; 
  	var cloudAction = null;
  	var message=null;

  	var counter = 0;

	var returns = {} ;

	messageCreator.fetch()
	.then(
		function(object){
  			Parse.Cloud.useMasterKey();

  			cloudAction = new CloudAction();
		    cloudAction.set("status", "pending");
	     	cloudAction.set("type","build_message");
		    cloudAction.set("service", returns.service);
		    cloudAction.set("user", user);

		    /* Create the service with the role as ACL*/
		    var acl = new Parse.ACL();
		    acl.setReadAccess(user, true);
		    acl.setWriteAccess(user, true);
		    
		    message = build_message(messageCreator);
  			message.set("ACL", acl);
		    return message.save(true);
		}
	).then(
		function(object){
			cloudAction.set("status", "OK");
	        return cloudAction.save(true);
		}
	).then(
		function(object){
      		response.success('{"messageId":"'+message.id+'"}');
		}
	).then(
		null,
		function(error){
			console.log(error);
	  		error_response(request,response, 410, error);
      		if (cloudAction != null){
			    cloudAction.set("status", "KO");
	            cloudAction.save(true);
	        }
		}
	);

});

