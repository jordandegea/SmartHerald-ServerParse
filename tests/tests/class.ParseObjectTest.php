<?php

use Parse\ParseUser;
use Parse\ParseClient;
use Parse\ParseObject;
use Parse\ParseCloud;

class ParseObjectTest{
	
	public static function fetchMustSucceed($object, $useMasterKey = false){
		try{
			return $object->fetch($useMasterKey);
		}catch(Exception $e){
			throw new Exception("Test failed and must succeed", 1, $e);
		}
	}

	public static function fetchMustFail($object, $useMasterKey = false){
		try{
			$object->fetch($useMasterKey);
		}catch(Exception $e){
			return true;
		}
		throw new Exception("Test succeed and must fail", 1);
	}

	public static function saveMustSucceed($object, $useMasterKey = false){
		try{
			return $object->save($useMasterKey);
		}catch(Exception $e){
			throw new Exception("Test failed and must succeed", 1, $e);
		}
	}

	public static function saveMustFail($object, $useMasterKey = false){
		try{
			$object->save($useMasterKey);
		}catch(Exception $e){
			return true;
		}
		throw new Exception("Test succeed and must fail", 1);
	}
	
}