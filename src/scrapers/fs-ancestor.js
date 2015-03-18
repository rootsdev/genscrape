var debug = require('debug')('fs-ancestor'),
    utils = require('../utils'),
    _ = require('lodash');

var urls = [
  utils.urlPatternToRegex("https://familysearch.org/tree/*")
];

module.exports = function(register){
  register(urls, run);
};

function run(emitter){
  debug('run');
  window.onhashchange = function(){
    processHash(emitter);
  };
  processHash(emitter);
}

// Called every time the hash changes
function processHash(emitter) {    
  debug('processHash');

  // Remove previous search links and show the ajax loader
  var hashParts = utils.getHashParts();
  
  debug('hashParts', hashParts);
  
  if( hashParts['view'] == 'ancestor' ) {
    
    // Get personId and spouseId
    var personId = hashParts['person'];
    var spouseId = hashParts['spouse'];
    
    // If we have a personId and we are in the ancestor view, build the urls
    if(personId) {
      
      debug('personId', personId);
      
      // Get person info; process it when both ajax calls return
      getPersonWithRelationships(personId)
      .done(function(data) {
        debug('response');
        emitter.emit('data', normalizeData(data, personId, spouseId));
      })
      .fail(function(error){
        debug('ajax error', error);
        emitter.emit('error', error);
      }); 
    } else {
      emitter.emit('noData');
      debug('no personId');
    }
  } else {
    emitter.emit('noData');
    debug('not in the ancestor view');
  }
}

function normalizeData(responseData, personId, spouseId) {
  var returnData = {},
      person = getPerson(responseData, personId);
      
  // Primary person's name    
  var nameParts = getNameParts(person);
  returnData.givenName = nameParts.givenName;
  returnData.familyName = nameParts.familyName;

  // Birth
  var birthInfo = getBirthInfo(person);
  returnData.birthPlace = birthInfo.place;
  returnData.birthDate = birthInfo.date;

  // Death
  var deathInfo = getDeathInfo(person);
  returnData.deathDate = deathInfo.date;
  returnData.deathPlace = deathInfo.place;
  
  // Parents
  var parents = getParents(responseData, personId);
  if(parents.mother){
    var motherNameParts = getNameParts(parents.mother);
    returnData.motherGivenName = motherNameParts.givenName;
    returnData.motherFamilyName = motherNameParts.familyName;
  }
  if(parents.father){
    var fatherNameParts = getNameParts(parents.father);
    returnData.fatherGivenName = fatherNameParts.givenName;
    returnData.fatherFamilyName = fatherNameParts.familyName;
  }
  
  // Spouse and marriage
  var spouseRelationship = getSpouseRelationship(responseData, personId, spouseId);
  if(spouseRelationship){
    var spouseId = spouseRelationship.person1.resourceId === personId ? 
          spouseRelationship.person2.resourceId : 
          spouseRelationship.person1.resourceId,
        spouse = getPerson(responseData, spouseId);
    if(spouse){
      var spouseNameParts = getNameParts(spouse);
      returnData.spouseGivenName = spouseNameParts.givenName;
      returnData.spouseFamilyName = spouseNameParts.familyName;
    }
    var marriageData = getFactInfo(spouseRelationship, 'http://gedcomx.org/Marriage');
    if(marriageData){
      returnData.marriageDate = marriageData.date;
      returnData.marriagePlace = marriageData.place;
    }
  }

  return returnData;
}

/**
 * Get the specified person, by id
 */
function getPerson(data, personId){
  return _.find(data.persons, {id: personId});
}

/**
 * Get a spouse relationship. If spouseId is defined then we look
 * first for one with that spouse or return the first with any spouse.
 */
function getSpouseRelationship(data, personId, spouseId){
  var spouseRel;
  if(spouseId){
    var rels = _.compact([
      _.find(data.relationships, {
        type: 'http://gedcomx.org/Couple',
        person1: { resourceId: personId },
        person2: { resourceId: spouseId }
      }),
      _.find(data.relationships, {
        type: 'http://gedcomx.org/Couple',
        person2: { resourceId: personId },
        person1: { resourceId: spouseId }
      })
    ]);
    if(rels[0]){
      spouseRel = rels[0];
    }
  } 
  
  // If we didn't find a relationship with the given spouse or if
  // no particular spouse was specified then just get the first
  // relationship with any spouse
  if(!spouseRel) {
    var rels = _.compact([
      _.find(data.relationships, {
        type: 'http://gedcomx.org/Couple',
        person1: { resourceId: personId }
      }),
      _.find(data.relationships, {
        type: 'http://gedcomx.org/Couple',
        person2: { resourceId: personId }
      })
    ]);
    if(rels[0]){
      spouseRel = rels[0];
    }
  }
  
  return spouseRel;
}

/**
 * Find the mother and father for the given person.
 * Looks for the first relationship where the specified person
 * is a child and returns the mother and father for that relationship.
 */
function getParents(data, personId){
  var returnData = {},
      parentsRelationship = _.find(data.childAndParentsRelationships, {child: {resourceId: personId}});
  if(parentsRelationship){
    if(parentsRelationship.father){
      returnData.father = getPerson(data, parentsRelationship.father.resourceId);
    }
    if(parentsRelationship.mother){
      returnData.mother = getPerson(data, parentsRelationship.mother.resourceId);
    }
  }
  return returnData;
}

/**
 * Get the given and family name for a person
 */
function getNameParts(person){
  var returnData = {},
      preferredName = _.find(person.names, {preferred: true}),
      preferredParts = preferredName.nameForms[0].parts;
      
  if(preferredParts){
    returnData.givenName = utils.maybe(_.find(preferredParts, {type:'http://gedcomx.org/Given'})).value;
    returnData.familyName = utils.maybe(_.find(preferredParts, {type:'http://gedcomx.org/Surname'})).value;
  } else {
    preferredParts = utils.splitName(preferredName.nameForms[0].fullText);
    returnData.givenName = preferredParts[0];
    returnData.familyName = preferredParts[1];
  }
  
  return returnData;
}

/**
 * Get the birth date and place for a person
 */
function getBirthInfo(person){
  return getFactInfo(person, 'http://gedcomx.org/Birth');
}

/**
 * Get the death date and place for a person
 */
function getDeathInfo(person){
  return getFactInfo(person, 'http://gedcomx.org/Death');
}

/**
 * Get the date and place for the first fact of the given type
 */
function getFactInfo(obj, type){
  var factInfo = {},
      fact = _.find(obj.facts, {type: type});
  if(fact){
    if(fact.date){
      factInfo.date = utils.maybe(utils.maybe(fact.date.normalized)[0]).value || fact.date.original;
    }
    if(fact.place){
      factInfo.place = utils.maybe(utils.maybe(fact.place.normalized)[0]).value || fact.place.original;
    }
  }
  return factInfo;
}

/**
 * AJAX request for person and relationship data
 */
function getPersonWithRelationships(personId){
  return $.getJSON('https://familysearch.org/platform/tree/persons-with-relationships?persons&person='+personId);
}