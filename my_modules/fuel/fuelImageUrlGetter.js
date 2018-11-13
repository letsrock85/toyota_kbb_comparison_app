var clone = require('clone');
var request = require('request');

var fuelImageUrlGetter = function(fuelId, queryObj, shotCode, callback) {

  // Clone request parameters
  var qs = clone(queryObj);
  // Apply a shot code
  qs.shotCode = shotCode;
  // ID is a part of url
  var url = "https://api.fuelapi.com/v1/json/vehicle/" + fuelId;

  var requestObject = {
    method: 'GET',
    url: url,
    qs: qs
  };

  request(requestObject, function(err, response, body) {
    if(err) return callback(new Error("Car info request to Fuel failed"));

    var data;
    var url;

    try {
      data = JSON.parse(body);
    } catch (e) {
      return callback(new Error("Something other than JSON received from Fuel"));
    }

    try {
      // Try to access the url
      url = data.products[0].productFormats[0].assets[0].url;
    } catch (e) {
      return callback(new Error("Can not extract an image URL from Fuel response"));
    }

    // Update to a secure address
    url = url.replace("http://", "https://");

    // Return
    return callback(null, url);
  });

}

module.exports = fuelImageUrlGetter;
