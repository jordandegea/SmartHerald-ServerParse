<?php
use Parse\ParseUser;
use Parse\ParseClient;
use Parse\ParseObject;
use Parse\ParseException;

class UserObjectTest{

	public static function LoginMustSucceed($user, $password = null){
		try{
			if (!$password){
				$password = $user;
			}
			ParseUser::logIn($user, $password) ;
		}catch(Exception $e){
			throw new Exception("Login must succeed", 1, $e);
		}
	}

	public static function LoginMustFail($user, $password = null){
		try{
			if (!$password){
				$password = $user;
			}
			ParseUser::logIn($user, $password) ;
		}catch(Exception $e){
			return true;
		}
		throw new Exception("Login must fail", 1);
	}

	public static function subscribe_user($name, $useMasterKey=false){
		$user = new ParseUser();
		$user->set("username", $name);
		$user->set("password", $name);
		$user->set("email", $name."@example.com");

		try {
		  $user->signUp();
		  // Hooray! Let them use the app now.
		  return $user;
		} catch (ParseException $ex) {
		  echo "Error: " . $ex->getCode() . " " . $ex->getMessage();
		}
	}

}