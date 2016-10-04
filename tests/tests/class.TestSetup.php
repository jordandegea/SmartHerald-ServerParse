<?php
use Parse\ParseUser;
use Parse\ParseClient;
use Parse\ParseObject;
use Parse\ParseException;

class TestSetup{

	private static $users = array();
	private static $services = array();
	
	public static function loadUsers($nb){
		if ( count(self::$users) > 0 )
			throw new Exception("Users already loaded", 1);
			
		for ( $i = 0 ; $i < $nb ; $i++){
			self::$users[$i] = UserObjectTest::subscribe_user("user".$i, true);
		}
	}

	public static function getUsername($userId){
		return self::$users[$userId]->get('username');
	}

	public static function getUser($userId){
		return self::$users[$userId];
	}

	public static function getService($serviceId){
		return self::$services[$serviceId];
	}

	public static function addService($userId, $expire, $name, $description){
		if ( count(self::$services) < $userId ){
			throw new Exception("Can't add these services already loaded", 1);
		}
		$resultJson  = ParseCloudTest::runMustSucceed(
					"create_service", 
					[ 
						"userId"=>self::$users[$userId]->getObjectId(),
						"name"=>$name, 
					  	"description"=>$description,
					  	"messagesUsers"=>"0"
					], 
					true);
		$serviceId = json_decode($resultJson)->serviceId;

		$service = new ParseObject("Service", $serviceId);
		self::$services[] = $service;
	}


}