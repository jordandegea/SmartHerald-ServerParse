require('./function.check_service_owner.js');

/**
 *
 *
 * @param request.user
 * @param request.params.serviceId
 * @param request.params.messageId
 * @param request.params.summary
 * @param request.params.content
 */
Parse.Cloud.define("edit_message", function(request, response) {

	if (!request.user || !request.params.messageId || 
		!request.params.summary || ! request.params.content){
	    error_response(request,response, 002);
	    return ;
	}
  	Parse.Cloud.useMasterKey();

	var user = request.user ; 
	var content = request.params.content;
	var summary = request.params.summary;

	var Message = Parse.Object.extend("Message");
	var message = new Message();
	message.id = request.params.messageId;

  	var serviceConfiguration = null ; 
	var returns = {} ;
  	
	check_service_owner(returns, request.params.serviceId, user)
	.then( /* Get ServiceConfiguration object */
		function(object){
			serviceConfiguration = returns.serviceConfiguration;
			/* Check expiration */
			if (serviceConfiguration.get('messagesUsers') >= serviceConfiguration.get('subscriptions')){
			    return message.fetch();
			}else{
  				error_response(request,response, 41);
			}
		}
	).then(
		function(object){
			/* Edit Message with summary and content */
		    message.set("content", content);
		    message.set("summary", summary);

		    return message.save();
		}
	).then(
		function(object){
      		response.success('{"messageId":"'+message.id+'"}');
		}
	).then(null, /* Catch error */
		function(error) {
      		console.log(error);
	  		error_response(request,response, 410, error);
		}
	);
});