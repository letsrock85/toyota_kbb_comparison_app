var request = require('request');
var clone = require('clone');
var log4js = require('log4js');
var multisort = require('multisort');
var logger = log4js.getLogger();

// My modules
// var smartSort = require('../smartSort')

var fuelIdGetter = function(vehicle, queryObj, callback) {
  var URL = "https://api.fuelapi.com/v1/json/vehicles";
  // Copy
  var qs = clone(queryObj);
  // Add
  qs.year = vehicle.year;
  qs.make = vehicle.manufacturer;
  qs.model = vehicle.series;
  // Form an object for request module
  var requestObject = {
    method: 'GET',
    url: URL,
    qs: qs
  };

  request(requestObject, function(err, response, body) {
    if(err) return callback(err);

    var trimSorterResult;
    var fuelId;
    var data;

    try {
      data = JSON.parse(body);
    } catch (e) {
      return callback(new Error("Something other than JSON received from Fuel for " + vehicle.series));
    }

    try {
      // It shound not have a property "code"
      if(data.hasOwnProperty('code')) {
        throw new Error(vehicle.series + " not found on Fuel");
      }

      var criteria = [
        'model_name',
        'trim.length',
        'trim.charAt(1)',
        'bodytype.length',
        'bodytype.charAt(1)'
      ];

      multisort(data, criteria);

      // Pick the ID
      fuelId = data[0].id;
      // Check for being OK
      if (!fuelId) throw new Error("Fuel ID of " + vehicle.series + " is invalid");
    } catch (e) {
      logger.debug(e.message);
      logger.debug("");
      return callback(e);
    }

    // Success!
    return callback(null, fuelId);

  });

}

module.exports = fuelIdGetter;
