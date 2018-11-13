var excel2json = require("node-excel-to-json");

// My modules
var lookupTableUpdater = require('./lookupTableUpdater');

var KEYS_TO_KEEP = [
  'VehicleId',
  'PrimaryBodyStyle',
  'Year',
  'Manufacturer',
  'Model',
  'Style'
];

var lookupTableConverter = function(path, callback) {

  function pullOutTheFirstSheet(data) {
  	// To get firt keyword
  	function first(obj) {
  		for (var a in obj) return a;
  	}
  	// Pick first child/sheet
  	var object = data[first(data)];
  	// Return
  	return object;
  }

  excel2json(path, function(err, data) {
    if(err) return callback(err)

    var data = pullOutTheFirstSheet(data);

    // Optimize data
    lookupTableUpdater(data, KEYS_TO_KEEP, function(err, data) {
      if(err) return callback(err);
      // Return data back to the app
      callback(null, data);
    });

  });

}

module.exports = lookupTableConverter;
