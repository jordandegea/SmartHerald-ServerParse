
standalone_ios_push = function(service, serviceConfiguration, message){

	var tokens = [];

	var installationsQuery = new Parse.Query(Parse.Installation);
	installationsQuery.equalTo("channels", service.get("canonicalName")); // Like a contains
	installationsQuery.equalTo("deviceType", "ios"); 
	
	var options = { 
        //pfx: __dirname + '/../conf/'+serviceConfiguration.get("pushIOSDev").name(),
        //production: false,
        pfx: __dirname + '/../conf/'+serviceConfiguration.get("pushIOSProd").name(),
        production: true,
        passphrase: '', 
        bundleId: serviceConfiguration.get("iOSStandaloneBundleID"),
	    batchFeedback: true,
	    interval: 300
    };
    //return saveURLFile(serviceConfiguration.get("pushIOSDev").url(), __dirname + '/../conf/'+serviceConfiguration.get("pushIOSDev").name())
	return saveURLFile(serviceConfiguration.get("pushIOSProd").url(), __dirname + '/../conf/'+serviceConfiguration.get("pushIOSProd").name())
  		.then(
			function(object) {
		  		return installationsQuery.find();
			}
		).then(
			function(installations){
				for (var i = 0; i < installations.length; i++) {
					console.log(installations[i].get("deviceToken"));
			      tokens.push(installations[i].get("deviceToken"));
			    }

				if(installations.length<=0) {
					return 0;
				}
				
				standalone_ios_push_sender(options, tokens, service.get("name") +": " + message.get("summary"));		
			}
		);

};