
var Expert = function(overall, dynamics, comfort, design, safety, value) {
  this.ratings = {};
  this.ratings.overall = overall || 0;
  this.ratings.dynamics = dynamics || 0;
  this.ratings.comfort = comfort || 0;
  this.ratings.design = design || 0;
  this.ratings.safety = safety || 0;
  this.ratings.value = value || 0;
}

module.exports = Expert;
