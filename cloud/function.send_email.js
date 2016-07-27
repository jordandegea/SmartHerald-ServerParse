send_email = function(from, to, subject, text, html) {

	var mailOptions = {
	    from: from, 
	    to: to, 
	    subject: subject, 
	    text: text,
	    html, html
	};

	Mail.sendMail(mailOptions, function(error, info){
	    if(error){
	        console.error(error, mailOptions);
	    }else{
	        console.log('Message sent: ' + info.response);
	    };
	});
}