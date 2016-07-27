check_service_owner = function(returns, serviceId, user){
	
	var Service = Parse.Object.extend("Service");
	var service = new Service();
	service.id = serviceId;

	var ServicesOwners = Parse.Object.extend("ServicesOwners");
  	var servicesOwnersQuery = new Parse.Query(ServicesOwners);
  	servicesOwnersQuery.equalTo('client', user);

	return service.fetch().then( /* Get Service object */
      function(object){
      	returns.service = object;
	  	/* Check own of Service */
  		servicesOwnersQuery.equalTo('service', service);
	  	return servicesOwnersQuery.first();
	  }
	).then(
		function(object){
			returns.serviceOwner = object;
			serviceConfiguration = service.get("configuration");
			returns.serviceConfiguration = serviceConfiguration;
			return serviceConfiguration.fetch();
		}
	);
}
