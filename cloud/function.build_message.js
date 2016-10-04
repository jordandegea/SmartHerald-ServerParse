build_message = function(message_creator){


	var Message = Parse.Object.extend("Message");
	var message = new Message();

	message.set("service", message_creator.get("service"));
	message.set("summary", message_creator.get("summary"));

	var base_css = message_creator.get("base_css");
	var custom_css = message_creator.get("custom_css");

	var js_jquery = message_creator.get("js_jquery");
	var js_jquery_v = message_creator.get("js_jquery_v");
	var js_bootstrap = message_creator.get("js_bootstrap");

	var content = "<html><head>";

	content += "<title>"+message_creator.get("summary")+"</title>"
	content += "<meta charset=\"utf-8\">"+
  				"<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">";
				"<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\"/>";
	if (base_css != "" ){
		content += "<link type=\"text/css\" rel=\"stylesheet\" href=\"{$"+base_css+"}\" media=\"all\"/>";
	}
	if (custom_css != "" ){
		content += "<style>"+custom_css+"</style>";
	}

	content += "</head><body>"

	content += message_creator.get("content");

	if ( js_jquery ){
		if ( typeof(js_jquery_v) == "undefined" ){
			content += "<script src=\"{$js_jquery}\" />";
		}else{
			content += "<script src=\"{$js_jquery"+js_jquery_v+"}\" />";
		}	
	}
	if (js_bootstrap){
		content += "<script src=\"{$js_bootstrap}\" />";
	}

	content += "</body>";
	content += "</html>"

	message.set("content", content);
	message.set("sent", false);

	return message;
}