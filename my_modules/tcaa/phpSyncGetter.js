var request = require('request');

var phpSyncGetter = function(from, to, callback) {
  var url = "http://www.tcaadev.com/phpsync/sync.php";
  // Copy
  var qs = {
    from: from,
    to: to
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
      return callback(new Error("Something other than JSON received from the TCAA sync script"));
    }
    // If object has an error throw it
    if(obj.error) return callback(new Error(obj.error));
    // If empty
    if(!obj) return callback(new Error("Invalid response from TCAA sync script"));
    // Success!
    return callback(null, obj);
  });
}

module.exports = phpSyncGetter;
