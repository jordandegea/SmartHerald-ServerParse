<?php 
require_once __DIR__."/setup.php";

use Parse\ParseCloud;
use Parse\ParseUser;
use Parse\ParseException;
use Parse\ParseObject;
use Parse\ParseQuery;

$testNumber = 1; 

UITest::display_title(basename(__FILE__));

TestSetup::loadUsers(1);
TestSetup::addService(0, (new \Datetime("now"))->add(new \DateInterval("P2M")), "service 1", "description of service 1");
TestSetup::addService(0, (new \Datetime("now"))->add(new \DateInterval("P2M")), "service 2", "description of service 2");

function write_message($serviceId, $summary, $content, $useMasterKey = false){
	return ParseCloudTest::runMustSucceed(
		'write_message', 
		[
			"serviceId" => $serviceId,
			"summary" => $summary,
			"content" => $content
		], 
		$useMasterKey);
}

# Get Messages
try{
	UserObjectTest::LoginMustSucceed(TestSetup::getUsername(0));
	write_message(TestSetup::getService(0)->getObjectId(), "Service 1 Sum 1", "content1");
	write_message(TestSetup::getService(0)->getObjectId(), "Service 1 Sum 2", "content2");
	write_message(TestSetup::getService(0)->getObjectId(), "Service 1 Sum 3", "content3");
	write_message(TestSetup::getService(0)->getObjectId(), "Service 1 Sum 4", "content4");
	write_message(TestSetup::getService(1)->getObjectId(), "Service 2 Sum 1", "content5");
	write_message(TestSetup::getService(1)->getObjectId(), "Service 2 Sum 2", "content6");
	write_message(TestSetup::getService(1)->getObjectId(), "Service 2 Sum 3", "content7");

	$query = new ParseQuery("Message");
	$messages = $query->find(true);
	
	BasicTest::compareMustBeEqual(count($messages), 7);
	BasicTest::compareMustBeEqual($messages[0]->summary, "Service 1 Sum 1");
	BasicTest::compareMustBeEqual($messages[0]->content, "content1");
	BasicTest::compareMustBeEqual($messages[1]->summary, "Service 1 Sum 2");
	BasicTest::compareMustBeEqual($messages[1]->content, "content2");
	BasicTest::compareMustBeEqual($messages[2]->summary, "Service 1 Sum 3");
	BasicTest::compareMustBeEqual($messages[2]->content, "content3");
	BasicTest::compareMustBeEqual($messages[3]->summary, "Service 1 Sum 4");
	BasicTest::compareMustBeEqual($messages[3]->content, "content4");

	UITest::display_result(true, "Get Service");
}catch(Exception $e){
	UITest::display_result(false, "Get Service", $e);
	print_r($e);
}
