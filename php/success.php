<?php
header("Content-Type: application/json;charset=utf-8");
$region = htmlspecialchars($_GET["region"]);
if(empty($region)) {
  echo '{ error: "Parameter is required" }';
} else {
  error_log(strtoupper($region)." comparison data has been processed successfully", 1, "jason.b@wolaverdesigns.com, dmitry.k@wolaverdesigns.com");
  echo '{ "message": "sent" }';
}
?>
