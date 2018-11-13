var request = require('request');

var KBB_API_KEY = require('../../constants').KBB_API_KEY;
var DEFAULT_ZIP_CODE = require('../../constants').DEFAULT_ZIP_CODE;

var getData = function(bossId, competitorId, type, zipcode, callback) {

  if(!parseInt(bossId)) return callback(new Error("Invalid ID for Boss"));
  if(!parseInt(competitorId)) return callback(new Error("Invalid ID for Competitor"));

  var url = "https://sandbox.api.kbb.com/ads/v1/ratings/" + type;
  var qs = {
    "api_key": KBB_API_KEY,
    "campaign-key": "API_Example",
    "zipcode": zipcode || DEFAULT_ZIP_CODE,
    "vehicleIds": bossId + "," + competitorId
  }

  // Form an object for request module
  var requestObject = {
    method: 'GET',
    url: url,
    qs: qs
  };

  // Do the request
  request(requestObject, function(err, response, body) {
    if(err) return callback(new Error("Request for comparison data faild"));

    var obj;
    // Try to parse
    try {
      obj = JSON.parse(body);
    } catch (e) {
      return callback(new Error("Something other than JSON received"));
    }

    // If not empty
    if(!obj) return callback(new Error("Invalid response"));

    callback(null, obj);

  });

}

module.exports = getData;
