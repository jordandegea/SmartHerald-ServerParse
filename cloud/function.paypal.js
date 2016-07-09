
paypal_credentials_prod_user = "admin_api1.sinenco.com";
paypal_credentials_prod_password = "NEFEVRA6BSW9YZKE";
paypal_credentials_prod_signature = "AQUag5xua3ZezEqjYyFCFGvX9SNyAuGEIjvqo5CitrwD5lInQHNZCffZ";
paypal_credentials_dev_user = "jordan.degea_api1.gmail.com";
paypal_credentials_dev_password = "W7A29LTYLQPFULT2";
paypal_credentials_dev_signature = "AFcWxV21C7fd0v3bYYYRCpSSRl31AvgQwWdOKycGwX1VyOBS0rTS.IUn";
paypal_url_sandbox = "https://api-3t.sandbox.paypal.com/nvp";
paypal_url = "https://api-3t.paypal.com/nvp";

paypal_DoExpressCheckoutPayment = function(sandbox, token, amount, payer_id){

	return Parse.Cloud.httpRequest({
	  url: (sandbox)?paypal_url_sandbox:paypal_url,
	  params: {
	    USER: (sandbox)?paypal_credentials_dev_user:paypal_credentials_prod_user,
	    PWD: (sandbox)?paypal_credentials_dev_password:paypal_credentials_prod_password,
	    SIGNATURE: (sandbox)?paypal_credentials_dev_signature:paypal_credentials_prod_signature,
	  	METHOD:"DoExpressCheckoutPayment",
	  	VERSION:"93",
	  	TOKEN:token,
	  	PAYERID:payer_id,
		PAYMENTREQUEST_0_PAYMENTACTION:"SALE",
		PAYMENTREQUEST_0_AMT:amount,
		PAYMENTREQUEST_0_CURRENCYCODE:"EUR" 
	  }
	});
}

paypal_GetExpressCheckoutDetails = function(sandbox, token){

	return Parse.Cloud.httpRequest({
	  url: (sandbox)?paypal_url_sandbox:paypal_url,
	  params: {
	    USER: (sandbox)?paypal_credentials_dev_user:paypal_credentials_prod_user,
	    PWD: (sandbox)?paypal_credentials_dev_password:paypal_credentials_prod_password,
	    SIGNATURE: (sandbox)?paypal_credentials_dev_signature:paypal_credentials_prod_signature,
	  	METHOD:"GetExpressCheckoutDetails",
	  	VERSION:"93",
	  	TOKEN:token
	  }
	})
}


paypal_check_payment = function(sandbox, purchase){

	return paypal_GetExpressCheckoutDetails(sandbox, purchase.get("token"))
	.then(
		function(httpResponse) {
		  var nvp = [];
		  parse_str(httpResponse.text, nvp);
		  if (!("PAYERID" in nvp)){
		  	throw new Error("GetExpressCheckoutDetailsPayerId");
		  }
		  payer_id = nvp["PAYERID"];
		  return paypal_DoExpressCheckoutPayment(sandbox, purchase.get("token"), purchase.get("amount"), payer_id);
	  	}
	).then(
		function(httpResponse) {
		  var nvp = [];
		  parse_str(httpResponse.text, nvp);

		  if (!("ACK" in nvp) || nvp["ACK"] != "Success"){
		  	throw new Error("DoExpressCheckoutPaymentFailure");
		  }
		  purchase.set("infos", httpResponse.text);
		  return purchase.save(true);
		}, 
		function(httpResponse) {
			throw new Error("DoExpressCheckoutPaymentRequest");
		}
	);
}