subscription_update = function(returns, serviceId, user){
  var counter = 0;

  var cloudAction = null;
  var CloudAction = Parse.Object.extend("CloudAction");
  
  // Expiration - 30 minutes from now
  var d = new Date();
  var time = ( 1800 * 1000);
  var expirationDate = new Date(d.getTime() - (time));

  return check_service_owner(returns, serviceId, user)
  .then(
    function(object){
      var query = new Parse.Query(CloudAction);
      query.equalTo("service", returns.service);
      query.equalTo("type","subscription_update");
      query.greaterThanOrEqualTo("createdAt", expirationDate);
      return query.first();
    }
  ).then(
    function(object){
      if(typeof(object) != "undefined"){
        return returns.counter = returns.serviceConfiguration.get("subscriptions");
      }
      
      var Subscription = Parse.Object.extend("Subscription");
      var query = new Parse.Query(Subscription);
      query.equalTo("service", returns.service);
      return query.find().then(
        function(results) {
          var promise = Parse.Promise.as();
          results.forEach(
            function(result, index) {
              // For each item, extend the promise with a function to delete it.
              promise = promise.then(
                function() {
                  var userLoop = result.get('user');
                  var Session = Parse.Session;
                  var query = new Parse.Query(Session);
                  query.equalTo("user", userLoop);
                  return query.count();
                }
              ).then(
                function(count){
                  counter += count;
                }
              );
            }
          );
          return promise;
        }
      ).then(
        function(){
          returns.counter = counter;
          serviceConfiguration.set("subscriptions", counter);
          return serviceConfiguration.save();
        }
      ).then(
        function(){
          var cloudAction = new CloudAction();
          cloudAction.set("status", "OK");
          cloudAction.set("service", returns.service);
          cloudAction.set("user", user);
          cloudAction.set("type","subscription_update");
          cloudAction.add("logs",{counter:returns.counter});
          return cloudAction.save(true);
        }
      );
    }
  );

}