<?php
use Parse\ParseUser;
use Parse\ParseClient;
use Parse\ParseObject;

class BasicTest{

	public static function compareMustBeEqual($A, $B){
		if ($A != $B){
			throw new Exception("Compare must be equal", 1);
		}
	}

	public static function compareMustNotBeEqual($A, $B){
		if ($A != $B){
			throw new Exception("Compare must not be equal", 1);
		}
	}


}