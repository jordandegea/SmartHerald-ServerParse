subscription_handler = function(request, response, prefix_code, subscription_function){

  if (!request.user){
    error_response(request,response, 002);
    return ;
  }
  
  Parse.Cloud.useMasterKey();
  
  var Service = Parse.Object.extend("Service");
  var service = new Service();
  service.id = request.params.serviceId;

  var user = request.user;
  var serviceConfiguration = null;
  
  var step = 1 ;

  /* Get User object */
  service.fetch().then( /* Fetching service */
    function(object) {
      step++;
      var Subscription = Parse.Object.extend("Subscription");
      var query = new Parse.Query(Subscription);
      query.equalTo("user", user);
      query.equalTo("service", service);
      return query.find();
    }
  ).then( /* Finding Existing subscription */
    function(objects) {
      step++;
      return subscription_function(request, objects, user, service);
    }
  ).then( /* Creating Subscription */
    function(object) {
      step++;
      success_response(request,response, prefix_code+0);
    }
  ).then(null, /* Catch error */
    function(error) {
      error_response(request,response, prefix_code+step, error);
    }
  );
}

/**
 * Add an entry in Subscription Class in order to subscribe 
 * a user to a service
 * 
 * @param request.params.serviceId 
 */
Parse.Cloud.define("subscribe", function(request, response) {
  subscription_function = function(request, objects, user, service){
    var serviceConfiguration = service.get("configuration");

    return serviceConfiguration.fetch().then(
      function(object) {
        object.increment("subscriptions");
        return object.save();
      }
    ).then(
      function(object) {
        if ( objects.length == 0 ){
          var acl = new Parse.ACL();
          acl.setReadAccess(user, true);

          var Subscription = Parse.Object.extend("Subscription");
          var Subscription = new Subscription();

          Subscription.set("user", user);
          Subscription.set("service", service);
          Subscription.set("notification", false);
          Subscription.set("ACL", acl);
          return Subscription.save();
        }else{
          error_response(request,response, 103, {message:"already subscribed"});
        }
      }
    );
  }
  subscription_handler(request, response, 100, subscription_function);
});


/**
 * Remove an entry in Subscription Class in order to unsubscribe 
 * a user to a service
 * 
 * @param request.user
 * @param request.params.serviceId 
 */
Parse.Cloud.define("unsubscribe", function(request, response) {
  subscription_function = function(request, objects, user, service){ 
    var serviceConfiguration = service.get("configuration");

    return serviceConfiguration.fetch().then(
      function(object) {
        object.increment("subscriptions", -1);
        return object.save();
      }
    ).then(
      function(object) {
        if ( objects.length > 0 ){
         return objects[0].destroy();
       }else{
          success_response(request,response, 121);
       }
      }
    );
  }
  subscription_handler(request, response, 120, subscription_function);
});
