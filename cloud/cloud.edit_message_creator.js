require('./function.check_service_owner.js');

Parse.Cloud.beforeSave("MessageCreator", function(request, response) {
	console.log("");
	console.log("");
	console.log("");
console.log(request.object);
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
console.log(oldMessageBuilder.get("service"));
console.log(newMessageBuilder.get("service"));
			if (oldMessageBuilder.get("service").id != newMessageBuilder.get("service").id){
				response.error("you cannot change the service associated");
console.log("service");
				return ; 
			}
console.log("success");
			response.success();
			return ;
		}
	);

});
