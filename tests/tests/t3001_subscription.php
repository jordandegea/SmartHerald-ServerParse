<?php 
require_once __DIR__."/setup.php";

use Parse\ParseCloud;
use Parse\ParseUser;
use Parse\ParseException;

UITest::display_title(basename(__FILE__));

TestSetup::loadUsers(1);
TestSetup::addService(0, (new \Datetime("now"))->add(new \DateInterval("P2M")), "service 1", "description of service 1");


#Subscribe user1 on service1
try{
	UserObjectTest::LoginMustSucceed(TestSetup::getUsername(0));
	ParseCloudTest::runMustSucceed('subscribe', ["serviceId" => TestSetup::getService(0)->getObjectId()], false);
	UITest::display_result(true, "Subscribe");
}catch(Exception $e){
	UITest::display_result(false, "Subscribe", $e);
}

#Unubscribe user1 on service1
try{
	UserObjectTest::LoginMustSucceed(TestSetup::getUsername(0));
	ParseCloudTest::runMustSucceed("unsubscribe", ["serviceId" => TestSetup::getService(0)->getObjectId()], false);
	UITest::display_result(true, "Unsubscribe");
}catch(Exception $e){
	UITest::display_result(false, "Unsubscribe", $e);
}


#Subscribe twice must fail
try{
	UserObjectTest::LoginMustSucceed(TestSetup::getUsername(0));
	ParseCloudTest::runMustSucceed('subscribe', ["serviceId" => TestSetup::getService(0)->getObjectId()], false);
	ParseCloudTest::runMustFail('subscribe', ["serviceId" => TestSetup::getService(0)->getObjectId()], false);
	UITest::display_result(true, "Double subscribe must fail");
}catch(Exception $e){
	UITest::display_result(false, "Double subscribe must fail", $e);
}

#Unubscribe twice must fail
try{
	ParseCloudTest::runMustSucceed("unsubscribe", ["serviceId" => TestSetup::getService(0)->getObjectId()], false);
	ParseCloudTest::runMustSucceed("unsubscribe", ["serviceId" => TestSetup::getService(0)->getObjectId()], false, 121);
	UITest::display_result(true, "Double unsubscribe must fail");
}catch(Exception $e){
	UITest::display_result(false, "Double unsubscribe must fail", $e);
}

## Test error returned
try{
	UserObjectTest::LoginMustSucceed(TestSetup::getUsername(0));
	ParseCloudTest::runMustSucceed('subscribe', ["serviceId" => TestSetup::getService(0)->getObjectId()], false);
	ParseCloudTest::runMustFail('subscribe', ["serviceId" => TestSetup::getService(0)->getObjectId()], true);
	UITest::display_result(true, "Subscribe must fail with admin debug");
}catch(Exception $e){
	UITest::display_result(false, "Subscribe must fail with admin debug", $e);
}

