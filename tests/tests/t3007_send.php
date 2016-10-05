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


try{
	$message = $service = $serviceConfiguration = null;

	UserObjectTest::LoginMustSucceed(TestSetup::getUsername(0));
	ParseCloudTest::runMustSucceed('subscribe', ["serviceId" => TestSetup::getService(0)->getObjectId()], false);

	$service = TestSetup::getService(0);
	ParseObjectTest::fetchMustSucceed($service, true);

	$result = ParseCloudTest::runMustSucceed(
		'add_messagesusers', 
		[
			"serviceId" => TestSetup::getService(0)->getObjectId(),
			"messagesUsers" => 100
		], 
		true);


	$message = new ParseObject("Message");
	$message->set("service", $service);
	$message->set("summary", "summary 1");
	$message->set("content", "content 1");
	ParseObjectTest::saveMustSucceed($message, true);
	ParseObjectTest::fetchMustSucceed($message, true);


	$serviceConfiguration = $service->get("configuration");
	ParseObjectTest::fetchMustSucceed($serviceConfiguration, true);

	//BasicTest::compareMustBeEqual($message->get('service')->getObjectId(), TestSetup::getService(0)->getObjectId());
	BasicTest::compareMustBeEqual($serviceConfiguration->get('messagesUsers'), 100);

	ParseObjectTest::saveMustSucceed($serviceConfiguration, true);

	$result = ParseCloudTest::runMustSucceed(
		'send', 
		[
			"serviceId" => TestSetup::getService(0)->getObjectId(),
			"messageId" => $message->getObjectId()
		], 
		false);

	ParseObjectTest::fetchMustSucceed($message, true);
	BasicTest::compareMustBeEqual($message->get('sent'), true);


	ParseObjectTest::fetchMustSucceed($serviceConfiguration, true);
	BasicTest::compareMustBeEqual($serviceConfiguration->get('messagesUsers'), 99);

	UITest::display_result(true, "Send");
}catch(Exception $e){
	UITest::display_result(false, "Send", $e);
}
