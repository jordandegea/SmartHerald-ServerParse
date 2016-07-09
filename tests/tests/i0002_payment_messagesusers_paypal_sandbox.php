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

try{
	UserObjectTest::LoginMustSucceed(TestSetup::getUsername(0));
	
	$package = new ParseObject("Package");

	$package->set("canonicalName","test_package");
	$package->set("type","messagesusers");
	$package->set("price",5);
	$package->setArray("params",["serviceId"]);
	$package->setAssociativeArray("values",["messagesusers"=>1500]);

	$package->save(true);

	
	$ret = ParseCloudTest::runMustSucceed("paypal_set_express_checkout", [ "packageName"=>"test_package", "serviceId"=>TestSetup::getService(0)->getObjectId(), "sandbox"=>true], false);
	$resultJson = json_decode($ret);
	$token = $resultJson->token;
	$url = $resultJson->url;
	echo "go to the url then press enter\n".$url."";
	
	readline();

	$ret = ParseCloudTest::runMustSucceed("paiement_check", ["paiement_token" => $token], false);

	$query = new ParseQuery("Purchase");
	$query->equalTo("token", $token);
	$purchase = $query->first(true);

	BasicTest::compareMustBeEqual($purchase->get("status"), "complete");
 
	$service = TestSetup::getService(0);
	ParseObjectTest::fetchMustSucceed($service, true);
	$serviceConfiguration = $service->get("configuration");
	ParseObjectTest::fetchMustSucceed($serviceConfiguration, true);
	BasicTest::compareMustBeEqual($serviceConfiguration->get('messagesUsers'), 1500);

}catch(Exception $e){
	print_r($e);
	UITest::display_result(false, "", $e);
}