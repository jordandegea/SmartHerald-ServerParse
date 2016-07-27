
standalone_ios_push_sender = function(options, tokens, message){
	var apn = require('apn');
	var conn = new apn.connection(options);
	/*
	conn.on("connected", function() {
	    console.log("Connected");
	});

	conn.on("transmitted", function(notification, device) {
	    console.log("Notification transmitted to:" + device.token.toString("hex"));
	});

	conn.on("transmissionError", function(errCode, notification, device) {
	    console.error("Notification caused error: " + errCode + " for device ", device, notification);
	    if (errCode === 8) {
	        console.log("A error code of 8 indicates that the device token is invalid. This could be for a number of reasons - are you using the correct environment? i.e. Production vs. Sandbox");
	    }
	});

	conn.on("timeout", function () {
	    console.log("Connection Timeout");
	});

	conn.on("disconnected", function() {
	    console.log("Disconnected from APNS");
	});

	conn.on("socketError", console.error);
	*/

    var note = new apn.notification();
    note.setAlertText(service.get("name") +": " + message.get("summary"));
    note.badge = 1;

    conn.pushNotification(note, tokens);
}