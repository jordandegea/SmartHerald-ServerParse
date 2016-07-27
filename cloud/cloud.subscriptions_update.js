require('./function.subscription_update.js');


/**
 * Create a service
 * 
 * @param request.params.serviceId
 * @param request.user
 */
Parse.Cloud.define("subscription_update", function(request, response) {

 if (!request.user || !request.params.serviceId){
    error_response(request,response, 002);
  }

  Parse.Cloud.useMasterKey();

  var user = request.user;
  
  var returns = {} ;

  subscription_update(returns, request.params.serviceId, user)
  .then(
    function(object){
      response.success('{"count":"'+returns.counter+'"}');
    }
  ).then(null, /* Catch error */
    function(error) {
      console.error(error);
      error_response(request,response, prefix_code);
    }
  );
  

});