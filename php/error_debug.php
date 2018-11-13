<?php
header("Content-Type: application/json;charset=utf-8");
$region = htmlspecialchars($_GET["region"]);
if(empty($region)) {
  echo '{ error: "Parameter is required" }';
} else {
  error_log("Debug Mode\nOops, an error occurred. Please, look at ".strtoupper($region)." logs: http://wolaverdesigns.com/kbb-automation-app/public/output/".$region."/log.txt", 1, "dmitry.k@wolaverdesigns.com");
  echo '{ "message": "sent" }';
}
?>
