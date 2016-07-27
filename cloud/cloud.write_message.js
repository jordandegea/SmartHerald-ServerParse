require('./function.check_service_owner.js');


/**
 * 
 * @param request.user
 * @param request.params.serviceId
 * @param request.params.summary
 * @param request.params.content
 */
Parse.Cloud.define("write_message", function(request, response) {

	if (!request.user || !request.params.serviceId || 
		!request.params.summary || ! request.params.content){
	    error_response(request,response, 002);
	    return ;
	}

  	Parse.Cloud.useMasterKey();

	var user = request.user ; 
	var content = request.params.content;
	var summary = request.params.summary;

  	var message=null;
  	var returns = {} ;

	check_service_owner(returns, request.params.serviceId, user)
	.then( /* Get ServiceConfiguration object */
		function(object){
			var serviceConfiguration = returns.serviceConfiguration;
			/* Check expiration */
			if (serviceConfiguration.get('messagesUsers') >= serviceConfiguration.get('subscriptions')){
				/* Create Message with summary and content */
				var Message = Parse.Object.extend("Message");
			    message = new Message();
			    /* Create the service with the role as ACL*/
			    var acl = new Parse.ACL();
			    acl.setReadAccess(user, true);

			    message.set("service", returns.service);
			    message.set("content", content);
			    message.set("summary", summary);
			    message.set("sent", false);
      			message.set("ACL", acl);

			    return message.save(true);
			}else{
  				error_response(request,response, 40, {message: "not enough messageUsers"});
			}
		}
	).then(
		function(object){
      		response.success('{"messageId":"'+object.id+'"}');
		}
	).then(null, /* Catch error */
		function(error) {
      		console.log(error);
	  		error_response(request,response, 40, error);
		}
	);
});
