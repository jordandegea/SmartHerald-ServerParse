require('./functions.js');

/**
 * 
 * @param request.master
 * @param request.params.serviceId
 * @param request.params.messagesUsers
 */
add_messagesusers = function(serviceConfiguration, value){
    messagesUsers = parseInt(serviceConfiguration.get('messagesUsers')) + value;
    serviceConfiguration.set('messagesUsers', messagesUsers+"");
    return serviceConfiguration.save();
}