
var Consumer = function(overall, comfort, performance, quality, reliability, styling, value, generationStart, generationEnd, numberOfRatings) {
  this.ratings = {};
  this.ratings.overall = overall || 0;
  this.ratings.comfort = comfort || 0;
  this.ratings.performance = performance || 0;
  this.ratings.quality = quality || 0;
  this.ratings.reliability = reliability || 0;
  this.ratings.styling = styling || 0;
  this.ratings.value = value || 0;
  this.details = {};
  this.details.generationStart = generationStart || 0;
  this.details.generationEnd = generationEnd || 0;
  this.details.numberOfRatings = numberOfRatings || 0;
}

module.exports = Consumer;
