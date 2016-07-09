<?php 
require_once __DIR__."/setup.php";

use Parse\ParseCloud;
use Parse\ParseUser;
use Parse\ParseException;
use Parse\ParseInstallation;

UITest::display_title(basename(__FILE__));

TestSetup::loadUsers(1);
TestSetup::addService(0, (new \Datetime("now"))->add(new \DateInterval("P2M")), "service 1", "description of service 1");


#Subscribe user1 on service1
try{
	$installation = new ParseInstallation();
	$installation->set("user", TestSetup::getUser(0));
	// Have to be added
	$installation->set("deviceToken", "test"); 
	$installation->set("deviceType", "custom"); 
	ParseObjectTest::saveMustSucceed($installation, false);
	ParseCloudTest::runMustSucceed('subscribe', ["serviceId" => TestSetup::getService(0)->getObjectId()], false);
	ParseCloudTest::runMustSucceed('update_installation', ["installationId" => $installation->getObjectId()], false);
	ParseObjectTest::fetchMustSucceed($installation, false);
	UITest::display_result(true, "Create Installation");
}catch(Exception $e){
	UITest::display_result(false, "Create Installation", $e);
}