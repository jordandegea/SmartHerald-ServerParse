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
TestSetup::addService(0, (new \Datetime("now"))->add(new \DateInterval("P2M")), "service 2", "description of service 1");
$messageCreator = null;

# Write a messageCreator
try{
	UserObjectTest::LoginMustSucceed(TestSetup::getUsername(0));
	$result = ParseCloudTest::runMustSucceed(
		'create_message_builder', 
		[
			"serviceId" => TestSetup::getService(0)->getObjectId(),
		], 
		false);
	$resultJson = json_decode($result);
	$messageId = $resultJson->messageId;

	$messageCreator = new ParseObject("MessageCreator", $messageId);
	ParseObjectTest::fetchMustSucceed($messageCreator, false);

	BasicTest::compareMustBeEqual($messageCreator->get('service')->getObjectId(), TestSetup::getService(0)->getObjectId());
    BasicTest::compareMustBeEqual($messageCreator->get("content"), "");
    BasicTest::compareMustBeEqual($messageCreator->get("summary"), "");
    BasicTest::compareMustBeEqual($messageCreator->get("base_css"), "");
    BasicTest::compareMustBeEqual($messageCreator->get("custom_css"), "");
    BasicTest::compareMustBeEqual($messageCreator->get("js_jquery"), false);
    BasicTest::compareMustBeEqual($messageCreator->get("js_jquery_v"), "");
    BasicTest::compareMustBeEqual($messageCreator->get("js_bootstrap"), false);

	UITest::display_result(true, "Write a messageCreator");
}catch(Exception $e){
	UITest::display_result(false, "Write a messageCreator", $e);
}

if ($messageCreator==null){
	UITest::display_result(false, "Fatal messageCreator null", $e);
	return ;
}

function checkEditField($message_creator, $field, $content){
	$message_creator->set($field, $content);
	ParseObjectTest::saveMustSucceed($message_creator, false);
	ParseObjectTest::fetchMustSucceed($message_creator, false);
    BasicTest::compareMustBeEqual($message_creator->get($field), $content);
}
function getMessageExport($message_creator){
	$result = ParseCloudTest::runMustSucceed(
		'build_message', 
		[
			"messageCreatorId" => $message_creator->getObjectId(),
		], 
		false);
	$resultJson = json_decode($result);
	$messageId = $resultJson->messageId;
	$message = new ParseObject("Message", $messageId);
	ParseObjectTest::fetchMustSucceed($message, true);

	return $message;
}

# Edit content
try{
	checkEditField($messageCreator, "content", "content test");

	$message = getMessageExport($messageCreator);
	BasicTest::mustContains($message->get("content"),"<body>content test</body>");
	UITest::display_result(true, "Edit a messageCreator: content");
}catch(Exception $e){
	UITest::display_result(false, "Edit a messageCreator: content", $e);
}

# Edit summary
try{
	checkEditField($messageCreator, "summary", "summary test");
	UITest::display_result(true, "Edit a messageCreator: summary");
}catch(Exception $e){
	UITest::display_result(false, "Edit a messageCreator: summary", $e);
}

# Edit base_css
try{
	checkEditField($messageCreator, "base_css", "bootstrap");
	$message = getMessageExport($messageCreator);
	BasicTest::mustContains($message->get("content"),'<link type="text/css" rel="stylesheet" href="{$bootstrap}"' );
	UITest::display_result(true, "Edit a messageCreator: base_css");
}catch(Exception $e){
	UITest::display_result(false, "Edit a messageCreator: base css", $e);
}
# Edit custom_css
try{
	checkEditField($messageCreator, "custom_css", "html{color:#000}");
	$message = getMessageExport($messageCreator);
	BasicTest::mustContains($message->get("content"),'<style>html{color:#000}</style>' );
	UITest::display_result(true, "Edit a messageCreator: custom_css");
}catch(Exception $e){
	UITest::display_result(false, "Edit a messageCreator: custom css", $e);
}
# Edit js_jquery
try{
	checkEditField($messageCreator, "js_jquery", true);
	$message = getMessageExport($messageCreator);
	BasicTest::mustContains($message->get("content"),'<script src="{$js_jquery}" />' );
	UITest::display_result(true, "Edit a messageCreator: js_query");
}catch(Exception $e){
	UITest::display_result(false, "Edit a messageCreator: js_query", $e);
}
# Edit js_jquery_v
try{
	checkEditField($messageCreator, "js_jquery_v", "3.0.0");
	$message = getMessageExport($messageCreator);
	BasicTest::mustContains($message->get("content"),'<script src="{$js_jquery3.0.0}" />' );
	UITest::display_result(true, "Edit a messageCreator: js_jquery_v");
}catch(Exception $e){
	UITest::display_result(false, "Edit a messageCreator: js_jquery_v", $e);
}
# Edit js_bootstrap
try{
	checkEditField($messageCreator, "js_bootstrap", true);
	$message = getMessageExport($messageCreator);
	BasicTest::mustContains($message->get("content"),'<script src="{$js_bootstrap}" />' );
	UITest::display_result(true, "Edit a messageCreator: js_bootstrap");
}catch(Exception $e){
	UITest::display_result(false, "Edit a messageCreator: js_bootstrap", $e);
}
# Edit service impossible
try{
	$messageCreator->set("service", TestSetup::getService(1));
	ParseObjectTest::saveMustFail($messageCreator, false);
	ParseObjectTest::fetchMustSucceed($messageCreator, false);
	UITest::display_result(true, "Edit a messageCreator must fail: service");
}catch(Exception $e){
	UITest::display_result(false, "Edit a messageCreator must fail: service", $e);
}


# Export messageCreator
try{
	$messageCreator->set("service", TestSetup::getService(1));
	ParseObjectTest::saveMustFail($messageCreator, false);
	ParseObjectTest::fetchMustSucceed($messageCreator, false);
	UITest::display_result(true, "Edit a messageCreator must fail: service");
}catch(Exception $e){
	UITest::display_result(false, "Edit a messageCreator must fail: service", $e);
}





