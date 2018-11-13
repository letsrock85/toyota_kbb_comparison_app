var fuelImageUrlGetter = require('./fuelImageUrlGetter');

// Two requests to Fuel API. The second happens if the first fails
var fuelImageHandler = function (fuelId, requestsParams, shotCode, callback) {
  fuelImageUrlGetter(fuelId, requestsParams.default, shotCode, function(err, imageUrl) {
    if (err) {
      // Faild with default parameters. Moving on with alternative
      fuelImageUrlGetter(fuelId, requestsParams.alternative, shotCode, function(err, imageUrl) {
        if (err) return callback(err);
        callback(null, imageUrl);
      });
    } else {
      return callback(null, imageUrl);
    }
  });
}

module.exports = fuelImageHandler;
