create_service = function(user, name, description, messagesUsers){

  if( typeof(name)=='undefined'){throw new Error("missing name");}
  if( typeof(description)=='undefined'){throw new Error("missing description");}
  if( typeof(messagesUsers)=='undefined'){throw new Error("missing messagesUsers");}
  if( typeof(messagesUsers)=='string'){messagesUsers = parseInt(messagesUsers, 10);}
  
  var service = null;

  var name = name;

  var canonicalName = name;
  canonicalName = canonicalName
  .toLowerCase()
  .replace(" ", "_");

  var description = description;

  var messagesUsers = messagesUsers;

  var roleName = "service__" + canonicalName;
  var role = null;

  var Service = Parse.Object.extend("Service");
  var serviceQuery = new Parse.Query(Service);
  serviceQuery.equalTo('canonicalName', canonicalName);

  return serviceQuery.count().then(
    function(count) {
      if (count > 0){
          throw new Error("Service already created");
      }
      /* Create the role */ 
      role = new Parse.Role(roleName, new Parse.ACL(user));
      return role.save(true);
    }
  ).then(
    function(object){
      /* Add the entry in ServicesOwners linking user with service */
      var ServiceConfiguration = Parse.Object.extend("ServiceConfiguration");
      serviceConfiguration = new ServiceConfiguration();

      /* Create the service with the role as ACL*/

      serviceConfiguration.set("messagesUsers", messagesUsers);
      serviceConfiguration.set("subscriptions", 0);

      var acl = new Parse.ACL();


        // For now we don't validate services inscription
      acl.setReadAccess(user, true);
      serviceConfiguration.set("ACL", acl);
      return serviceConfiguration.save(true);
    }
  ).then(
    function(object){
      /* User retrieved, we are master */
      var Service = Parse.Object.extend("Service");
      service = new Service();

      /* Create the service with the role as ACL*/

      service.set("canonicalName", canonicalName);
      service.set("name", name);
      service.set("description", description);
      service.set("configuration", serviceConfiguration);
      
      var acl = new Parse.ACL();


        // For now we don't validate services inscription
      acl.setPublicReadAccess(true);
      acl.setReadAccess(role, true);
      acl.setWriteAccess(role, true);
      service.set("ACL", acl);
      return service.save(true);
    }
  ).then(
    function(object){
      /* Add the entry in ServicesOwners linking user with service */
      var ServicesOwners = Parse.Object.extend("ServicesOwners");
      servicesOwners = new ServicesOwners();

      /* Create the service with the role as ACL*/
      servicesOwners.set("client", user);
      servicesOwners.set("service", service);
      servicesOwners.set("admin", true);

      return servicesOwners.save(true);
    }
  ).then(
    function(object){
      return '{"serviceId":"'+service.id+'"}';
    },
    function(error) {
      throw new Error(error);
    }
  );
}