
/**
 * 
 * @param request.master
 * @param request.params.serviceId
 * @param request.params.messagesUsers
 */
add_messagesusers = function(serviceConfiguration, value){
    messagesUsers = parseInt(serviceConfiguration.get('messagesUsers')) + value;
    if ( typeof(messagesUsers) == "string"){
    	messagesUsers = parseInt(messagesUsers, 10);
    }
    serviceConfiguration.set('messagesUsers', messagesUsers);
    return serviceConfiguration.save();
}