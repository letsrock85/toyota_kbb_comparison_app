// My modules
var getData = require('./getData');
var Expert = require('./models/expert');

var TYPE = "expert";
var PROP_NAME = "name";
var KEYWORDS = [
  "Overall Rating",
  "Driving Dynamics",
  "Comfort & Convenience",
  "Design: Interior & Exterior",
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

var getExpertData = function(bossId, competitorId, callback) {
  getData(bossId, competitorId, TYPE, null, function(err, data) {
    if (err) return callback(err);

    var boss = data.expertRatings[0];
    var competitor = data.expertRatings[1];

    if(!boss) return callback(new Error("No ratings for Boss in Expert data"));
    if(!competitor) return callback(new Error("No ratings for Competitor in Expert data"));

    var bossObj = new Expert(
      getValue(boss.ratings, 0),
      getValue(boss.ratings, 1),
      getValue(boss.ratings, 2),
      getValue(boss.ratings, 3),
      null,
      getValue(boss.ratings, 4)
    );

    var competitorObj = new Expert(
      getValue(competitor.ratings, 0),
      getValue(competitor.ratings, 1),
      getValue(competitor.ratings, 2),
      getValue(competitor.ratings, 3),
      null,
      getValue(competitor.ratings, 4)
    );

    return callback(null, { boss: bossObj, competitor: competitorObj });

  });
}

module.exports = getExpertData;
