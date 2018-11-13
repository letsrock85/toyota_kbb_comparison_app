<?php
header("Content-Type: application/json;charset=utf-8");
$region = htmlspecialchars($_GET["region"]);
if(empty($region)) {
  echo '{ error: "Parameter is required" }';
} else {
  error_log("Oops, an error occurred. Please, look at ".strtoupper($region)." logs: http://wolaverdesigns.com/kbb-automation-app/public/output/".$region."/log.txt", 1, "jason.b@wolaverdesigns.com, dmitry.k@wolaverdesigns.com, molly.c@wolaverdesigns.com");
  echo '{ "message": "sent" }';
}
?>
