<?php
use Parse\ParseUser;
use Parse\ParseClient;
use Parse\ParseObject;

class UITest{

	private static $successTests = 0;
	private static $totalTests = 0;
	private static $fileout_errors = true;
	private static $datestart = null;

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
		if ( self::$datestart == null){
			self::$datestart = (new DateTime())->format('Y-m-d_H-i-s');
		}
		print("Start Test: $name \n");
	}

	public static function display_result($success, $message, $exception = null){
		self::$totalTests++;
		if ($success){
			self::$successTests++;
			print("Test ".self::$totalTests.": $message ok\n");
		}else{
			print("Test ".self::$totalTests.": $message failed\n");
			self::exportError($message, $exception);
		}
	}
	
	public static function exportError($title, $content){
		if (!self::$fileout_errors){
			print_r($content);
			return; 
		}

		@mkdir("logs");
		@mkdir("logs/".self::$datestart);

		$canonicalTitle = preg_replace('#[^[:alnum:]]#u', '', $title);
		$canonicalTitle = str_replace(" ", "_", $canonicalTitle);

		$fp = fopen("logs/".self::$datestart."/error.".$canonicalTitle.".txt", 'w');
		fwrite($fp, print_r($content,true));
		fclose($fp);

	}
}