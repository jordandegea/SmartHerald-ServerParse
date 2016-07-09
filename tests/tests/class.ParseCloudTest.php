<?php

use Parse\ParseUser;
use Parse\ParseClient;
use Parse\ParseObject;
use Parse\ParseCloud;

class ParseCloudTest{
	
	public static function runMustSucceed($name, $data = [], $useMasterKey = false, $codeExpected = null){
		try{
			$ret = ParseCloud::run($name, $data, $useMasterKey);
			if ($codeExpected != null){
				if ($ret["code"] == $codeExpected){
					return $ret ;
				}
			}else{
				return $ret;
			}
		}catch(Exception $e){
			throw new Exception("Test failed and must succeed", 1, $e);
		}
		throw new Exception("Test succeed with bad return code", 1);
	}

	public static function runMustFail($name, $data = [], $useMasterKey = false){
		try{
			ParseCloud::run($name, $data, $useMasterKey);
		}catch(Exception $e){
			return true;
		}
		throw new Exception("Test succeed and must fail", 1, null);
	}
	
}