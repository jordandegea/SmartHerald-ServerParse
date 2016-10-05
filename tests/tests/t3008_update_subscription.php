<?php 
require_once __DIR__."/setup.php";

use Parse\ParseCloud;
use Parse\ParseUser;
use Parse\ParseException;
use Parse\ParseObject;

$testNumber = 1; 

UITest::display_title(basename(__FILE__));

TestSetup::loadUsers(10);
TestSetup::addService(0, (new \Datetime("now"))->add(new \DateInterval("P2M")), "service 1", "description of service 1");

#Subscribe user1 on service1
try{
	for ($i = 0 ;$i < 10 ; $i++){
		UserObjectTest::LoginMustSucceed(TestSetup::getUsername($i));
		ParseCloudTest::runMustSucceed('subscribe', ["serviceId" => TestSetup::getService(0)->getObjectId()], false);
	}
	UserObjectTest::LoginMustSucceed(TestSetup::getUsername(0));

	$result = ParseCloudTest::runMustSucceed(
		'subscription_update', 
		[
			"serviceId" => TestSetup::getService(0)->getObjectId()
		], 
		false);
	$resultJson = json_decode($result);
	BasicTest::compareMustBeEqual($resultJson->count, 10);



	UITest::display_result(true, "Update Subscriptions");
}catch(Exception $e){
	UITest::display_result(false, "Update Subscriptions", $e);
}