var request = require('request');

var emailer = {};

var ERROR_PHP = "http://wolaverdesigns.com/kbb-automation-app/php/error.php";
var ERROR_DEBUG_PHP = "http://wolaverdesigns.com/kbb-automation-app/php/error_debug.php";
var SUCCESS_PHP = "http://wolaverdesigns.com/kbb-automation-app/php/success.php";
var SUCCESS_DEBUG_PHP = "http://wolaverdesigns.com/kbb-automation-app/php/success_debug.php";

emailer.sendError = function(region, isDebug, callback) {
  var url = isDebug ? ERROR_DEBUG_PHP : ERROR_PHP;
  // Copy
  var qs = {
    region: region
  };
  // Form an object for request module
  var requestObject = {
    method: 'GET',
    url: url,
    qs: qs
  };
  // Do the request
  request(requestObject, function(err, response, body) {
    if(err) return callback(err);
    var obj;
    try {
      obj = JSON.parse(body);
    } catch (e) {
      return callback(new Error("Something other than JSON received from the Blue Host script"));
    }
    // If object has an error throw it
    if(obj.error) return callback(new Error(obj.error));
    // If empty
    if(!obj) return callback(new Error("Invalid response from TCAA sync script"));
    // Success!
    return callback(null, obj);
  });
}

emailer.sendSuccess = function(region, isDebug, callback) {
  var url = isDebug ? SUCCESS_DEBUG_PHP : SUCCESS_PHP;
  // Copy
  var qs = {
    region: region
  };
  // Form an object for request module
  var requestObject = {
    method: 'GET',
    url: url,
    qs: qs
  };
  // Do the request
  request(requestObject, function(err, response, body) {
    if(err) return callback(err);
    var obj;
    try {
      obj = JSON.parse(body);
    } catch (e) {
      return callback(new Error("Something other than JSON received from the Blue Host script"));
    }
    // If object has an error throw it
    if(obj.error) return callback(new Error(obj.error));
    // If empty
    if(!obj) return callback(new Error("Invalid response from TCAA sync script"));
    // Success!
    return callback(null, obj);
  });
}

module.exports = emailer;
