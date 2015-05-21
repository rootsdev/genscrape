var debug = require('debug')('findmypast:Relations'),
    Person = require('./Person'),
    Family = require('./Family'),
    _ = require('lodash');

var Relations = function(data){
  this.data = data;
};

Relations.prototype.getPersonData = function(personId){
  
  personId = parseInt(personId, 10);
  
  var personData = {},
      person = this.getPerson(personId);
  
  if(person){
    
    // Main person vitals
    personData.givenName = person.getGivenName();
    personData.familyName = person.getSurname();
    personData.birthDate = person.getBirthDate();
    personData.birthPlace = person.getBirthPlace();
    personData.deathDate = person.getDeathDate();
    personData.deathPlace = person.getDeathPlace();
    
    // Spouse and Marriage
    if(this.data.Relations && this.data.Relations.SpousalFamilys){
    
      var spouseFamilyId = this.data.Relations.SpousalFamilys[0];
      var spouseFamily = this.getFamily(spouseFamilyId);
      
      debug('spouseFamilyId:' + spouseFamilyId);
      
      if(spouseFamily){
        
        personData.marriageDate = spouseFamily.getMarriageDate();
        personData.marriagePlace = spouseFamily.getMarriagePlace();
        
        var spouseId = spouseFamily.getSpouseId(personId),
            spouse = this.getPerson(spouseId);
            
        if(spouse){
          
          personData.spouseGivenName = spouse.getGivenName();
          personData.spouseFamilyName = spouse.getSurname();
          
        }
      }
    }
  }
  
  return personData;
};

Relations.prototype.getPerson = function(personId){
  debug('getPerson:' + personId);
  var person = _.find(this.data.Persons, function(person){
    return person.Id === personId;
  });
  if(person){
    return new Person(person);
  }
};

Relations.prototype.getFamily = function(familyId){
  debug('getFamily:' + familyId);
  var family = _.find(this.data.Familys, function(family){
    return family.Id === familyId;
  });
  if(family){
    return new Family(family);
  }
}

module.exports = Relations;