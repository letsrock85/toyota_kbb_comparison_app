var DEFAULT_MODEL_YEAR = require("../../../constants").DEFAULT_MODEL_YEAR;

var Vehicle = function(id, manufacturer, series, year) {
  this.id = id;
  this.series = series;
  this.manufacturer = manufacturer;
  this.year = year || DEFAULT_MODEL_YEAR;
}

module.exports = Vehicle;
