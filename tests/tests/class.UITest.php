<?php
use Parse\ParseUser;
use Parse\ParseClient;
use Parse\ParseObject;

class UITest{

	private static $successTests = 0;
	private static $totalTests = 0;

	public static function getTotalCount(){
		return self::$totalTests;
	}
	public static function getSuccessTestCount(){
		return self::$successTests;
	}

	public static function resetTestCount(){
		self::$successTests = 0;
		self::$totalTests = 0;
	}

	public static function display_title($name){
		print("Start Test: $name \n");
	}

	public static function display_result($success, $message, $exception = null){
		self::$totalTests++;
		if ($success){
			self::$successTests++;
			print("Test ".self::$totalTests.": $message ok\n");
		}else{
			print("Test ".self::$totalTests.": $message failed\n");
		}
	}
	
}