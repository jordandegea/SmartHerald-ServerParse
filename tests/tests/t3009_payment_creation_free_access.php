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

try{
	UserObjectTest::LoginMustSucceed(TestSetup::getUsername(0));
	
	$package = new ParseObject("Package");

	$package->set("canonicalName","test_package");
	$package->set("type","creation");
	$package->set("price",5);
	$package->setArray("params",["name", "description"]);
	$package->setAssociativeArray("values",["messagesusers"=>150]);

	$package->save(true);

	
	$ret = ParseCloudTest::runMustSucceed("creation_free_access", [ "packageName"=>"test_package", "name"=>"Name", "description"=>"Description" , "sandbox"=>true, "access_code"=>"FREECODE_TEST"], false);
	$resultJson = json_decode($ret);
	$token = $resultJson->token;
	$ret = ParseCloudTest::runMustSucceed("paiement_check", ["paiement_token" => $token], false);

	$query = new ParseQuery("Purchase");
	$query->equalTo("token", $token);
	$purchase = $query->first(true);

	BasicTest::compareMustBeEqual($purchase->get("status"), "complete");

	$query = new ParseQuery("Service");
	$query->equalTo("canonicalName", "name");
	$query->includeKey("configuration");
	$service = $query->first(true);
	$configuration = $service->get("configuration");

	BasicTest::compareMustBeEqual($configuration->get("messagesUsers"), 150);
	UITest::display_result(true, "Payment by free access code for creation");

}catch(Exception $e){
	UITest::display_result(false, "Payment by free access code for creation", $e);
}

try{
	$ret = ParseCloudTest::runMustSucceed("creation_free_access", [ "packageName"=>"test_package", "name"=>"Name2", "description"=>"Description" , "sandbox"=>true, "access_code"=>"FREECODE_TEST", "website"=>"ok", "employees"=>"ok", "clients"=>"ok"], false);
	$resultJson = json_decode($ret);
	$token = $resultJson->token;
	$ret = ParseCloudTest::runMustSucceed("paiement_check", ["paiement_token" => $token], false);

	$query = new ParseQuery("Purchase");
	$query->equalTo("token", $token);
	$purchase = $query->first(true);

	BasicTest::compareMustBeEqual($purchase->get("status"), "complete");

	$query = new ParseQuery("Service");
	$query->equalTo("canonicalName", "name2");
	$query->includeKey("configuration");
	$service = $query->first(true);
	$configuration = $service->get("configuration");

	BasicTest::compareMustBeEqual($configuration->get("messagesUsers"), 150);
	UITest::display_result(true, "Payment by free access code for creation with stats");

}catch(Exception $e){
	UITest::display_result(false, "Payment by free access code for creation", $e);
}