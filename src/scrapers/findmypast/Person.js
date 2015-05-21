var Person = function(data){
  this.data = data;
}

Person.prototype.getGivenName = function(){
  return this.data.GivenNames;
}

Person.prototype.getSurname = function(){
  return this.data.Surnames;
}

module.exports = Person;