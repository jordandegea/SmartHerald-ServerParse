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


# Write a message
try{
	UserObjectTest::LoginMustSucceed(TestSetup::getUsername(0));
	$result = ParseCloudTest::runMustSucceed(
		'write_message', 
		[
			"serviceId" => TestSetup::getService(0)->getObjectId(),
			"summary" => "summary 1",
			"content" => "content 1"
		], 
		false);
	$resultJson = json_decode($result);
	$messageId = $resultJson->messageId;

	$message = new ParseObject("Message", $messageId);
	ParseObjectTest::fetchMustSucceed($message, false);

	BasicTest::compareMustBeEqual($message->get('service')->getObjectId(), TestSetup::getService(0)->getObjectId());
	BasicTest::compareMustBeEqual($message->get('summary'), "summary 1");
	BasicTest::compareMustBeEqual($message->get('content'), "content 1");

	UITest::display_result(true, "Write a message");
}catch(Exception $e){
	UITest::display_result(false, "Write a message", $e);
	print_r($e);
}


# Edit a message
try{
	UserObjectTest::LoginMustSucceed(TestSetup::getUsername(0));
	$result = ParseCloudTest::runMustSucceed(
		'edit_message', 
		[
			"messageId" => $message->getObjectId(),
			"serviceId" => TestSetup::getService(0)->getObjectId(),
			"summary" => "summary 1",
			"content" => "content 1"
		], 
		false);
	$resultJson = json_decode($result);
	$messageId = $resultJson->messageId;

	$message = new ParseObject("Message", $messageId);
	ParseObjectTest::fetchMustSucceed($message, false);

	BasicTest::compareMustBeEqual($message->get('service')->getObjectId(), TestSetup::getService(0)->getObjectId());
	BasicTest::compareMustBeEqual($message->get('summary'), "summary 1");
	BasicTest::compareMustBeEqual($message->get('content'), "content 1");

	UITest::display_result(true, "Edit a message");
}catch(Exception $e){
	UITest::display_result(false, "Edit a message", $e);
}
