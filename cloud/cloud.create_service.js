
require('./function.create_service.js');


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
        console.log(error);
        error_response(request,response, 400, error);
      }
    )
  

});
