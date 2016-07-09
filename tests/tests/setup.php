<?php
/**
 *
 *
 *
 *
 * Setup : 
 *		Create user1
 *		Create user2
 *		Create "service 1":
 *			- owned by user1
 *			- expire in 2 months
 *		Create "service 2"
 *			- owned by user1
 *			- expired since 1 month
 *
 */

require __DIR__.'/../vendor/autoload.php';
foreach (scandir(__DIR__) as $filename) {
    if (0 === strpos($filename, 'class.')) {
        require_once $filename;
    }
}

use Parse\ParseUser;
use Parse\ParseClient;
use Parse\ParseObject;

Class ParseStarter{

	private $forever_uid;
	const APPLICATION_ID="com.sinenco.sharednews";
	const MASTER_KEY="themasterkey";
	private $cloudFolder;

	private static $_instance = null;

	public static function start() {
		if(is_null(self::$_instance)) {
			self::$_instance = new self();  
		}
	}

	private function __construct(){
		$this->forever_uid = uniqid();
		$this->cloudFolder = exec('cd '.__DIR__.'/../../cloud/ && pwd');

		/* Forever Options*/
		$command = "forever start ";
		$command .= "-a ";
		$command .= "-s ";
		$command .= "> /dev/null ";
		$command .= "--spinSleepTime 2000 ";
		$command .= "--minUptime 2000 ";
		$command .= "--uid \"$this->forever_uid\" ";
		/* Parse options*/
		$command .= "`which parse-server` ";
		$command .= "--appId ".self::APPLICATION_ID." ";
		$command .= "--masterKey ".self::MASTER_KEY." ";
		$command .= "--cloud ".$this->cloudFolder."/main.js ";
		$command .= "--allowClientClassCreation false";

		//print($command."\n");
		
		//print(exec($command));

		/* Clean mongo */
		exec('echo "db.dropDatabase() \nuse test" | mongo --quiet');
		print("\n");
		
		sleep(4);

		foreach (scandir(__DIR__."/../database") as $filename) {
			if (strpos($filename, '.') != 0){
			    $databaseName = substr($filename, 0, -5);
			    exec("mongoimport --quiet --db test --collection ".$databaseName." --drop --file ./database/".$databaseName.".json");
			}
		}

		#First Initialise as MASTER
		ParseClient::initialize( self::APPLICATION_ID, "", self::MASTER_KEY );
		ParseClient::setServerURL('http://localhost:1337/parse');
		ParseClient::setConnectionTimeout(4);
		ParseClient::setTimeout(4);
	}

	public function __destruct(){
		$command = "forever -s stop \"$this->forever_uid\" > /dev/null &";
		//exec($command);
	}
}
ParseStarter::start();


