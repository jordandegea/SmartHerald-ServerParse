require('./function.check_service_owner.js');


/**
 * 
 * @param request.user
 * @param request.params.serviceId
 */
Parse.Cloud.define("create_message_builder", function(request, response) {

	if (!request.user || !request.params.serviceId){
	    error_response(request,response, 002);
	    return ;
	}

  	Parse.Cloud.useMasterKey();

	var user = request.user ; 

  	var messageBuilder=null;
  	var returns = {} ;
	check_service_owner(returns, request.params.serviceId, user)
	.then( /* Get ServiceConfiguration object */
		function(object){
			var serviceConfiguration = returns.serviceConfiguration;
			/* Check expiration */
			if (serviceConfiguration.get('messagesUsers') >= serviceConfiguration.get('subscriptions')){
				/* Create Message with summary and content */
				var MessageBuilder = Parse.Object.extend("MessageCreator");
			    messageBuilder = new MessageBuilder();

			    /* Create the service with the role as ACL*/
			    var acl = new Parse.ACL();
			    acl.setReadAccess(user, true);
			    acl.setWriteAccess(user, true);
			    
			    messageBuilder.set("service", returns.service);
			    messageBuilder.set("content", "");
			    messageBuilder.set("summary", "");
			    messageBuilder.set("base_css", "");
			    messageBuilder.set("custom_css", "");
			    messageBuilder.set("js_jquery", false);
			    messageBuilder.set("js_jquery_v", "");
			    messageBuilder.set("js_bootstrap", false);
      			messageBuilder.set("ACL", acl);

			    return messageBuilder.save(true);
			}else{
  				error_response(request,response, 40, {message: "not enough messageUsers"});
			}
		},function(error) {
      		console.log(error);
	  		error_response(request,response, 42, error);
		}
	).then(
		function(object){
      		response.success('{"messageId":"'+object.id+'"}');
		},
		function(error) {
      		console.log(error);
	  		error_response(request,response, 43, error);
		}
	).then(null, /* Catch error */
		function(error) {
      		console.log(error);
	  		error_response(request,response, 40, error);
		}
	);
});
