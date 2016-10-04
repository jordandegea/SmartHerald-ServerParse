<?php 
require_once __DIR__."/setup.php";

use Parse\ParseCloud;
use Parse\ParseUser;
use Parse\ParseException;
use Parse\ParseObject;

$testNumber = 1; 

UITest::display_title(basename(__FILE__));

TestSetup::loadUsers(1);
TestSetup::addService(0, (new \Datetime("now"))->add(new \DateInterval("P2M")), "service 1", "description of service 1");


# Edit Description
try{
	UserObjectTest::LoginMustSucceed(TestSetup::getUsername(0));

	$service = TestSetup::getService(0);

	ParseObjectTest::fetchMustSucceed($service, true);
	$serviceConfiguration = $service->get("configuration");
	ParseObjectTest::fetchMustSucceed($serviceConfiguration, true);

	$result = ParseCloudTest::runMustSucceed(
		'add_messagesusers', 
		[
			"serviceId" => TestSetup::getService(0)->getObjectId(),
			"messagesUsers" => 100
		], 
		true);

	$resultJson = json_decode($result);
	$serviceId = $resultJson->serviceId;

	$service = new ParseObject("Service", $serviceId);
	ParseObjectTest::fetchMustSucceed($service, true);
	ParseObjectTest::fetchMustSucceed($serviceConfiguration, true);
	
	//BasicTest::compareMustBeEqual($message->get('service')->getObjectId(), TestSetup::getService(0)->getObjectId());
	BasicTest::compareMustBeEqual($serviceConfiguration->get('messagesUsers'), 100);

	
	$result = ParseCloudTest::runMustSucceed(
		'add_messagesusers', 
		[
			"serviceId" => TestSetup::getService(0)->getObjectId(),
			"messagesUsers" => 150
		], 
		true);

	$resultJson = json_decode($result);
	$serviceId = $resultJson->serviceId;

	$service = new ParseObject("Service", $serviceId);
	ParseObjectTest::fetchMustSucceed($service, true);
	ParseObjectTest::fetchMustSucceed($service->get("configuration"), true);

	//BasicTest::compareMustBeEqual($message->get('service')->getObjectId(), TestSetup::getService(0)->getObjectId());
	BasicTest::compareMustBeEqual($service->get("configuration")->get('messagesUsers'), 250);


	UITest::display_result(true, "Add messagesUsers");
}catch(Exception $e){
	UITest::display_result(false, "Add messagesUsers", $e);
}
