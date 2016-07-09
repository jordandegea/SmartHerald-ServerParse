require('./functions.js');


/**
 * 
 * @param request.params.installationId
 * @param request.user
 */
Parse.Cloud.define("update_installation", function(request, response) {
	if (!request.params.installationId || !request.user){
	    error_response(request,response, 002);
	    return ;
  	}

  	Parse.Cloud.useMasterKey();

  	var step = 1 ;
	var user = request.user ; 

	var installation = new Parse.Installation();
	installation.id = request.params.installationId;


	var Subscription = Parse.Object.extend("Subscription");
  	var subscriptionQuery = new Parse.Query(Subscription);
  	subscriptionQuery.equalTo('user', user);
  	subscriptionQuery.include("service");

	installation.fetch().then(
		function(object) {
	      step++;
	      return subscriptionQuery.find();
	    }
	).then( /* Finding Existing subscription */
		function(objects) {
			step=10;
			for (var i = 0 ; i < objects.length ; i++){
				step++;
				installation.addUnique("channels", objects[i].get("service").get("canonicalName"));
			}
			return installation.save();
		}
	).then( /* Creating Subscription */
		function(object) {
			step++;
			success_response(request,response, 500+step);
		}
	).then(null, /* Catch error */
		function(error) {
			error_response(request,response, 500+step, error);
		}
	); 


});