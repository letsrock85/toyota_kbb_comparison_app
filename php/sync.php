<?php
// Path to the script http://www.tcaadev.com/phpsync/sync.php
header("Content-Type: application/json;charset=utf-8");

// Catch echos
ob_start();

// Send status function
function sendStatus($str, $err) {
	// Clear echo messages
	ob_end_clean();
	// Echo JSON object
	echo '{ "status": "'.$str.'", "error": "'.$err.'" }';
}

// from=http://wolaverdesigns.com/kbb-automation-app/public/output/lookupTable.json
$from = htmlspecialchars($_GET["from"]);

// to=se/kbb_automation_app/output/lookupTable.json
$to = htmlspecialchars($_GET["to"]);

// Check for being not empty
if(empty($from)) {
	sendStatus("fail", "Source is not given");
	exit();
}

// Check for being not empty
if(empty($to)) {
	sendStatus("fail", "Destination is not given");
	exit();
}

// Get content
$file_content = file_get_contents($from, FILE_USE_INCLUDE_PATH);

// Should be bigger than 8 bites
if(strlen($file_content) < 8) {
	sendStatus("fail", "Source file got 0 B length");
	exit();
}

// Define user
$ftp_server = "0368b9e.netsolvps.com";
$ftp_user_name = "wdtcaaftp";
$ftp_user_pass = "Wd@2016";

// Set up basic ftp connection
$conn_id = ftp_connect($ftp_server);

// Login with username and password
$login_result = ftp_login($conn_id, $ftp_user_name, $ftp_user_pass);

// Set as passive
ftp_pasv($conn_id, true);

// Check connection
if ((!$conn_id) || (!$login_result)) {
	sendStatus("fail", "FTP connection has failed");
	exit();
}

// Save the file
if(ftp_put($conn_id, $to, $from, FTP_ASCII)) {
	// Send success
	sendStatus("success", "");
} else {
	sendStatus("fail", "Cannot upload the file");
}

// Close the connection
ftp_close($conn_id);
?>
