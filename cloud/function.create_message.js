create_message = function(service, summary, content){

	var Message = Parse.Object.extend("Message");
    message = new Message();
    /* Create the service with the role as ACL*/

    message.set("service", service);
    message.set("content", content);
    message.set("summary", summary);

	return message;
}