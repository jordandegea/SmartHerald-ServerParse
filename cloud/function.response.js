
error_response = function(request, response, code, error){
	var return_error = "code:"+code;
	if (typeof(error)!='undefined'){
		return_error = return_error+",error:"+error.message;
	}
	response.error(return_error);
}

success_response = function(request, response, code, datas){
	if (typeof(datas)!='undefined'){
		datas.code = code;
  		response.success(datas);
	}else{
  		response.success({"code":code});
	}
}