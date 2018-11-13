var lookupTableUpdater = function(data, keysArr, callback) {
	var output = [];

	try {
		// Iterate the data converted from json
		for (var i = 0; i < data.length; i++) {
			var obj = data[i];
			var outputObject = {};
			// For each key
			for (var key in obj) {
				// If the key is listed in the keysArr save to a copy object
				if(keysArr.indexOf(key) > -1) {
					outputObject[key] = String((obj[key] ? obj[key] : ""));
				}
			}
			// In case there was a mistake in the json file
			if(outputObject) output.push(outputObject);
		}
	} catch (e) {
		return callback(new Error("Can not optimize the lookup table data"));
	}

	callback(null, output);

}

module.exports = lookupTableUpdater;
