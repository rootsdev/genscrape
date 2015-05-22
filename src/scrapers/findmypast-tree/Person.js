var fmpUtils = require('./utils');

var Person = function(data){
  this.data = data;
};

var proto = Person.prototype;

proto.getGivenName = function(){
  return this.data.GivenNames;
};

proto.getSurname = function(){
  return this.data.Surnames;
};

proto.getBirthDate = function(){
  return fmpUtils.getDate(this.data.BirthDate);
};

proto.getBirthPlace = function(){
  return this.data.BirthPlace;
};

proto.getDeathDate = function(){
  return fmpUtils.getDate(this.data.DeathDate);
};

proto.getDeathPlace = function(){
  return this.data.DeathPlace;
};

module.exports = Person;