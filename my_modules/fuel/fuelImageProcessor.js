var clone = require('clone');
var log4js = require('log4js');
var logger = log4js.getLogger();

// My modules
var fuelIdGetter = require('./fuelIdGetter');
var fuelImageHandler = require('./fuelImageHandler');
var FUEL_API_KEY = require('../../constants').FUEL_API_KEY;

var MAX_ERRORS = 5;

var fuelImageProcessor = function (vehicle, shotCode, callback) {
  // Parameters for Fuel API call
  var fuelRequestParams = {
    default: {
      "productID": 1,
      "productFormatIDs": 17,
      "api_key": FUEL_API_KEY
      // "shotCode": ""
    },
    alternative: {
      "productID": 2,
      "productFormatIDs": 12,
      "api_key": FUEL_API_KEY
      // "shotCode": ""
    }
  };

  var counter = 0;
  // Create a copy
  var vehicleClone = clone(vehicle);
  // Resave the year as number
  vehicleClone.year = parseInt(vehicleClone.year);

  function onError() {
    if (counter > MAX_ERRORS) return callback(new Error("Faild to get an image of " + vehicle.manufacturer + " " + vehicle.series + " on Fuel"));

    counter++;
    vehicleClone.year--;

    logger.debug("Faild to get an image of " + vehicle.manufacturer + " " + vehicle.series + " on Fuel. Trying one more time as " + vehicleClone.year + "");
    logger.debug("");

    // Recursion
    foo();
  }

  // Set a recursion
  function foo() {

    // Getting an image URL
    fuelIdGetter(vehicleClone, fuelRequestParams.default, function(err, fuelId) {
      if (err) return onError(err);
      // Request to Fuel API
      fuelImageHandler(fuelId, fuelRequestParams, shotCode, function(err, imageUrl) {
        if (err) return onError(err);
        logger.debug("Image URL for " + vehicleClone.manufacturer + " " + vehicleClone.year + " " + vehicleClone.series + " received from Fuel");
        logger.debug("");
        callback(null, imageUrl);
      });
    });

  }

  // Call the recursion
  foo();
}

module.exports = fuelImageProcessor;
