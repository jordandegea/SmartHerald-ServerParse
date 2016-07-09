user_message_change_state = function(request, response, prefix_code, change_function){

  if (!request.params.userMessageId || !request.user){
    error_response(request,response, 002);
    return ;
  }

  Parse.Cloud.useMasterKey();

  var UserMessage = Parse.Object.extend("UserMessage");
  var userMessage = new Parse.Query(UserMessage);
  userMessage.id = request.params.userMessageId ;

  var user = request.user;

  userMessage.fetch().then(  /* Get UserMessages object */
    function(object){
      /* Check user of UserMessages */
      if(object.user == user){
        /* Change state */
        change_function(userMessage);
        userMessage.save();
      }else{
        error_response(request,response, prefix_code + 2);
      }
    },
    function(error){
      error_response(request,response, prefix_code + 3);
    }
  ).then(
    function(object){
      success_response(request,response, prefix_code);
    },
    function(error){
      error_response(request,response, prefix_code + 4);
    }
  );
}

/**
 * Change the state of the read value to true
 * 
 * @param request.user
 * @param request.params.messageId : UserMessages id 
 */
Parse.Cloud.define("read_service", function(request, response) {
  change_function = function(userMessage){
    userMessage.read = true ; 
  };
  user_message_change_state(request, response, 30, change_function);
});

/**
 * Change the state of the read value to false
 * 
 * @param request.user
 * @param request.params.messageId 
 */
Parse.Cloud.define("unread_service", function(request, response) {
  change_function = function(userMessage){
    userMessage.read = false ; 
  };
  user_message_change_state(request, response, 31, change_function);
});

/**
 * Change the state of the star value to true
 * 
 * @param request.user
 * @param request.params.messageId 
 */
Parse.Cloud.define("star_service", function(request, response) {
  change_function = function(userMessage){
    userMessage.star = true ; 
  };
  user_message_change_state(request, response, 32, change_function);
});

/**
 * Change the state of the star value to false
 * 
 * @param request.user
 * @param request.params.messageId 
 */
Parse.Cloud.define("unstar_service", function(request, response) {
  change_function = function(userMessage){
    userMessage.star = false ; 
  };
  user_message_change_state(request, response, 33, change_function);
});
