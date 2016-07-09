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

	$result = ParseCloudTest::runMustSucceed(
		'change_description', 
		[
			"serviceId" => TestSetup::getService(0)->getObjectId(),
			"description" => "description changed"
		], 
		false);

	$resultJson = json_decode($result);
	$serviceId = $resultJson->serviceId;

	$service = new ParseObject("Service", $serviceId);
	ParseObjectTest::fetchMustSucceed($service, false);

	//BasicTest::compareMustBeEqual($message->get('service')->getObjectId(), TestSetup::getService(0)->getObjectId());
	BasicTest::compareMustBeEqual($service->get('description'), "description changed");

	UITest::display_result(true, "Change description");
}catch(Exception $e){
	UITest::display_result(false, "Change description", $e);
}
