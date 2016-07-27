
require('./function.add_messagesusers.js');


/**
 * 
 * @param request.master
 * @param request.params.serviceId
 * @param request.params.messagesUsers
 */
Parse.Cloud.define("add_messagesusers", function(request, response) {

  if (request.master){
    Parse.Cloud.useMasterKey();
  }else{
    error_response(request,response, 001);
    return;
  }

  if (!request.params.serviceId || !request.params.messagesUsers ){
    error_response(request,response, 002);
  }

  Parse.Cloud.useMasterKey();
  
  var Service = Parse.Object.extend("Service");
  var service = new Service();
  service.id = request.params.serviceId;

  var user = request.user;

  var messagesUsers = request.params.messagesUsers;

  var serviceConfiguration = null ; 

  var returns = {} ;
    
  service.fetch()
  .then(
    function(object){
      serviceConfiguration = service.get("configuration");
      return serviceConfiguration.fetch();
    }
  ).then(   /* Get the service */
    function(object){
      return add_messagesusers(serviceConfiguration, parseInt(messagesUsers));
    }
  ).then(
    function(object){
      response.success('{"serviceId":"'+service.id+'"}');
    }
  ).then(null, /* Catch error */
    function(error) {
      console.log(error);
      error_response(request,response, 500);
    }
  );

});