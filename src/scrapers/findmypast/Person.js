var debug = require('debug')('findmypast:Person');

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
  return getDate(this.data.BirthDate);
};

proto.getBirthPlace = function(){
  return this.data.BirthPlace;
};

proto.getDeathDate = function(){
  return getDate(this.data.DeathDate);
};

proto.getDeathPlace = function(){
  return this.data.DeathPlace;
};

function getDate(fmpDate){
  debug('getDate:' + fmpDate);
  if(fmpDate){
    var stringDate = '' + fmpDate,
        year = stringDate.substr(0, 4),
        month = stringDate.substr(4, 2),
        day = stringDate.substr(6, 2);
    return year + '-' + month + '-' + day;
  }
};

module.exports = Person;