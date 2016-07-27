
require('./function.check_service_owner.js');
/**
 * Change description of a service
 * 
 * @param request.params.serviceId
 * @param request.user
 * @param request.params.description
 */
Parse.Cloud.define("change_description", function(request, response) {

  if (!request.user || !request.params.serviceId || 
    !request.params.description ){
    error_response(request,response, 002);
  }

  Parse.Cloud.useMasterKey();
  
  var user = request.user;

  var description = request.params.description;

  var service = null;
  var serviceConfiguration = null ; 
  var returns = {} ;
    
  check_service_owner(returns, request.params.serviceId, user)
  .then(   /* Get the service */
    function(object){
      serviceConfiguration = returns.serviceConfiguration;
      service = returns.service;
      if (!returns.serviceOwner.get("admin")){
        throw new Error("not admin rights");
      }
      if (serviceConfiguration.get('messagesUsers') < serviceConfiguration.get('subscriptions')){
        throw new Error("not enough tokens");
      }
      if (description == ""){
        throw new Error("empty description");
      }

      service.set('description', description) ;
      return service.save();
    }
  ).then(
    function(object){
      response.success('{"serviceId":"'+service.id+'"}');
    }
  ).then(null, /* Catch error */
    function(error) {
      console.log(error);
      error_response(request,response, 420, error);
    }
  );

});