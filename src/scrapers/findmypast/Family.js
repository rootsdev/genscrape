var debug = require('debug')('findmypast:Family'),
    fmpUtils = require('./utils');

var Family = function(data){
  this.data = data;
};

var proto = Family.prototype;

proto.getSpouseId = function(personId){
  if(this.data.FatherId === personId){
    return this.data.MotherId;
  } else if(this.data.MotherId === personId){
    return this.data.FatherId;
  }
};

proto.getMarriageDate = function(){
  return fmpUtils.getDate(this.data.MarriageDate);
};

proto.getMarriagePlace = function(){
  return this.data.MarriagePlace;
};

module.exports = Family;
