require('./functions.js');
require('./function.create_service.js');
require('./function.add_messagesusers.js');

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
  
  var step = 1 ;

  var user = request.user;

  var Service = Parse.Object.extend("Service");
  var service = new Service();
  service.id = request.params.serviceId;

  var description = request.params.description;

  var ServicesOwners = Parse.Object.extend("ServicesOwners");
  
  var servicesOwnersQuery = new Parse.Query(ServicesOwners);
  
  servicesOwnersQuery.equalTo('client', user);

  servicesOwnersQuery.equalTo('admin', true);

  var ServiceConfiguration = Parse.Object.extend("ServiceConfiguration");
  var serviceConfigurationQuery = new Parse.Query(ServiceConfiguration);

  var serviceConfiguration = null ; 

  check_service_owner(step, service, servicesOwnersQuery, serviceConfiguration)
  .then(   /* Get the service */
    function(object){
      step++;
      serviceConfiguration = object;
      /* Check expiration */
      if (serviceConfiguration.get('messagesUsers') >= serviceConfiguration.get('subscriptions')){
        step++;
        if (description == ""){
          error_response(request,response, prefix_code+step);
        }else{
          step++;
          service.set('description', description) ;
          return service.save();
        }
      }else{
        error_response(request,response, prefix_code+step);
      }
    }
  ).then(
    function(object){
      step++;
      response.success('{"serviceId":"'+service.id+'"}');
    }
  ).then(null, /* Catch error */
    function(error) {
      error_response(request,response, prefix_code+step);
    }
  );

});


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
  
  var step = 1 ;

  var user = request.user;

  var Service = Parse.Object.extend("Service");
  var service = new Service();
  service.id = request.params.serviceId;

  var messagesUsers = request.params.messagesUsers;

  var ServicesOwners = Parse.Object.extend("ServicesOwners");
  
  var servicesOwnersQuery = new Parse.Query(ServicesOwners);
  
  servicesOwnersQuery.equalTo('client', user);

  servicesOwnersQuery.equalTo('admin', true);

  var serviceConfiguration = null ; 

  check_service_owner(step, service, servicesOwnersQuery, serviceConfiguration)
  .then(   /* Get the service */
    function(object){
      step++;
      serviceConfiguration = object;
      return add_messagesusers(serviceConfiguration,parseInt(messagesUsers));
    }
  ).then(
    function(object){
      step++;
      response.success('{"serviceId":"'+service.id+'"}');
    }
  ).then(null, /* Catch error */
    function(error) {
      error_response(request,response, prefix_code+step);
    }
  );

});


/**
 * Create a service
 * 
 * @param request.master
 * @param request.params.userId
 * @param request.params.name
 * @param request.params.description
 * @param request.params.expireDate
 * @param request.params.messagesUsers
 */
Parse.Cloud.define("create_service", function(request, response) {

  if (request.master){
    Parse.Cloud.useMasterKey();
  }else{
    error_response(request,response, 001);
    return;
  }

  if (!request.params.userId){error_response(request,response, 002, {message:"missing userId"});return;}
  if (!request.params.name) {error_response(request,response, 002, {message:"missing name"});return;}
  if (!request.params.description){error_response(request,response, 002, {message:"missing description"});return;}
  if (!request.params.messagesUsers){error_response(request,response, 002, {message:"missing messagesUsers"});return;}

  var user = new Parse.User;
  user.id = request.params.userId;

  user.fetch(true).then(
    function(object){
      return create_service(
        user, 
        request.params.name, 
        request.params.description, 
        request.params.messagesUsers);
    }
  ).then(
      function(ret){
        response.success(ret);
      },
      function(error){
        error_response(request,response, 400, error);
      }
    )
  

});
