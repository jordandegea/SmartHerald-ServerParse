require("./function.create_message.js");

check_description = function(message_creator){
	
	var message = create_message(
		message_creator.get("service"),
		message_creator.get("summary"),
		message_creator.get("content")
		);


	return message;
}