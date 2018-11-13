var DEFAULT_MODEL_YEAR = require("../../../constants").DEFAULT_MODEL_YEAR;

var Vehicle = function(manufacturer, series, year) {
  this.series = series;
  this.manufacturer = manufacturer;
  this.year = year || DEFAULT_MODEL_YEAR;
}

module.exports = Vehicle;
