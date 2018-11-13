// My modules
var getData = require('./getData');
var Consumer = require('./models/consumer');

var TYPE = "consumer";
var PROP_NAME = "name";
var KEYWORDS = [
  "Overall Rating",
  "Comfort",
  "Performance",
  "Quality",
  "Reliability",
  "Styling",
  "Value"
];

function findByProprty(array, prop, key) {
  return array.find(function(item) {
    return item[prop] == key;
  });
}

function getValue(array, index) {
  var num = findByProprty(array, PROP_NAME, KEYWORDS[index]).value;
  return parseFloat(num);
}

var getConsumerData = function(bossId, competitorId, callback) {
  getData(bossId, competitorId, TYPE, null, function(err, data) {
    if (err) return callback(err);

    var boss = data.consumerRatings[0];
    var competitor = data.consumerRatings[1];

    if(!boss) return callback(new Error("No ratings for Boss in Consumer data"));
    if(!competitor) return callback(new Error("No ratings for Competitor in Consumer data"));

    var bossObj = new Consumer(
      getValue(boss.ratings, 0),
      getValue(boss.ratings, 1),
      getValue(boss.ratings, 2),
      getValue(boss.ratings, 3),
      getValue(boss.ratings, 4),
      getValue(boss.ratings, 5),
      getValue(boss.ratings, 6),
      boss.generationBeginYear,
      boss.generationEndYear,
      boss.numberOfReviews || boss.numberOfRatings
    );

    var competitorObj = new Consumer(
      getValue(competitor.ratings, 0),
      getValue(competitor.ratings, 1),
      getValue(competitor.ratings, 2),
      getValue(competitor.ratings, 3),
      getValue(competitor.ratings, 4),
      getValue(competitor.ratings, 5),
      getValue(competitor.ratings, 6),
      competitor.generationBeginYear,
      competitor.generationEndYear,
      competitor.numberOfReviews || competitor.numberOfRatings
    );

    return callback(null, { boss: bossObj, competitor: competitorObj });

  });
}

module.exports = getConsumerData;
