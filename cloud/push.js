require('./functions.js');
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
			if ( parseInt(serviceConfiguration.get('messagesUsers')) > parseInt(serviceConfiguration.get('subscriptions'))){
				step++;
			    return message.fetch();
			}else{
  				error_response(request,response, 41+step, {message:"Not enough messagesUsers"});
			}
		}
	).then( /* Send to iOS */
		function(object){
			step++;
			if (message.get("sent") == true){
    			throw new Error();
			}
			step++;
			return Parse.Push.send({
			  	where: {
				  	"channels": "sinenco_fr",
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
				  	"channels": "sinenco_fr",
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

		    message.set("sent", true);
  			message.set("ACL", acl);

		    return message.save();
		}
	).then( /* Change state of message */
		function() {
			step++;
		    var messagesUsers = parseInt(serviceConfiguration.get('messagesUsers')) - parseInt(serviceConfiguration.get('subscriptions'));
		    serviceConfiguration.set('messagesUsers', messagesUsers+"");
		    return serviceConfiguration.save();
		}
	).then(
		function(object){
			step++;
      		success_response(request, response, 410);
		}
	).then(null, /* Catch error */
		function(error) {
	  		error_response(request,response, 410+step);
		}
	);
});

