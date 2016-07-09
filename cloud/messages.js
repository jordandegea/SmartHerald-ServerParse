require('./functions.js');

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

	var step = 1 ;
	var user = request.user ; 
	var content = request.params.content;
	var summary = request.params.summary;

	var Service = Parse.Object.extend("Service");
	var service = new Service();
	service.id = request.params.serviceId;

	var ServicesOwners = Parse.Object.extend("ServicesOwners");
  	var servicesOwnersQuery = new Parse.Query(ServicesOwners);
  	servicesOwnersQuery.equalTo('client', user);

  	var serviceConfiguration = null ; 
  	var message=null;
	/* Check content of summary and content */

	check_service_owner(step, service, servicesOwnersQuery, serviceConfiguration).then( /* Get ServiceConfiguration object */
		function(object){
			step++;
			serviceConfiguration = object;
			/* Check expiration */
			console.log(serviceConfiguration.get('messagesUsers'));
			console.log(serviceConfiguration.get('subscriptions'));
			if (serviceConfiguration.get('messagesUsers') >= serviceConfiguration.get('subscriptions')){
				/* Create Message with summary and content */
				var Message = Parse.Object.extend("Message");
			    message = new Message();
			    /* Create the service with the role as ACL*/
			    var acl = new Parse.ACL();
			    acl.setReadAccess(user, true);

			    message.set("service", service);
			    message.set("content", content);
			    message.set("summary", summary);
			    message.set("sent", false);
      			message.set("ACL", acl);

			    return message.save(true);
			}else{
  				error_response(request,response, 40+step, {message: "not enough messageUsers"});
			}
		}
	).then(
		function(object){
      		response.success('{"messageId":"'+object.id+'"}');
		}
	).then(null, /* Catch error */
		function(error) {
	  		error_response(request,response, 40+step, error);
		}
	);
});

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
			if (serviceConfiguration.get('messagesUsers') >= serviceConfiguration.get('subscriptions')){
				step++;
			    return message.fetch();
			}else{
  				error_response(request,response, 41+step);
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
			step++;
      		response.success('{"messageId":"'+message.id+'"}');
		}
	).then(null, /* Catch error */
		function(error) {
	  		error_response(request,response, 41+step);
		}
	);
});