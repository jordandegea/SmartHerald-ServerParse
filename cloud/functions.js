
/**
 *
 *
 *
 */
check_description = function(description){
	return description;
}




check_service_owner = function(step, service, servicesOwnersQuery, serviceConfiguration){
	return service.fetch().then( /* Get Service object */
      function(object){
	  	/* Check own of Service */
  		servicesOwnersQuery.equalTo('service', service);
	  	return servicesOwnersQuery.first();
	  }
	).then(
		function(object){
			serviceConfiguration = service.get("configuration");
			return serviceConfiguration.fetch();
		}
	);
}
