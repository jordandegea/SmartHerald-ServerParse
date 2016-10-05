require('./function.check_service_owner.js');

Parse.Cloud.beforeSave("MessageCreator", function(request, response) {

	var newMessageBuilder = request.object;
	var objectId = newMessageBuilder.id;
	if (typeof(objectId) == "undefined"){
		response.success();
		// New MessageCreator so OK
		return ;

	}
	var MessageBuilder = Parse.Object.extend("MessageCreator");
	var oldMessageBuilder = new MessageBuilder();
	oldMessageBuilder.id = objectId;

	oldMessageBuilder.fetch(true).then(
		function(object){
			if (oldMessageBuilder.get("service").id != newMessageBuilder.get("service").id){
				response.error("you cannot change the service associated");
				return ; 
			}
			response.success();
			return ;
		}
	);

});
