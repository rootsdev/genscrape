var debug = require('debug')('genscrape:scrapers:genealogieonline'),
    utils = require('../utils'),
    GedcomX = require('gedcomx-js');

var urls = [
  utils.urlPatternToRegex("https://www.genealogieonline.nl/*")
];

module.exports = function(register){
  register(urls, run);
};

function run(emitter){
  
  debug('run');
  
  var $schemaPerson = document.querySelector('[itemtype="http://schema.org/Person"]');
  
  if($schemaPerson) {
      
    debug('schema person');
      
    var gedx = new GedcomX(),
        primaryPerson = queryPerson($schemaPerson);
        
    gedx.addPerson(primaryPerson);
    
    queryPropAll($schemaPerson, 'spouse').map(queryPerson).forEach(function(spouse){
      gedx.addPerson(spouse);
      gedx.addRelationship({
        type: 'http://gedcomx.org/Couple',
        person1: primaryPerson,
        person2: spouse
      });
    });
    
    // TODO: ask Bob Coret about marriage info. It disappeared?
    
    queryPropAll($schemaPerson, 'parent').map(queryPerson).forEach(function(parent){
      gedx.addPerson(parent);
      gedx.addRelationship({
        type: 'http://gedcomx.org/ParentChild',
        person1: parent,
        person2: primaryPerson
      });
    });
    
    queryPropAll($schemaPerson, 'children').map(queryPerson).forEach(function(child){
      gedx.addPerson(child);
      gedx.addRelationship({
        type: 'http://gedcomx.org/ParentChild',
        person1: primaryPerson,
        person2: child
      });
    });
    
    // TODO: ask Bob why children don't have givenName and familyName
   
    emitter.emit('data', gedx);
  }
    
  else {
    emitter.emit('noData') ;     
  }  
}

/**
 * Get the GedcomX.Person data for schema.org Person
 * 
 * @param {Element} $element DOM Element representing a schema.org Person
 * @return {GedcomX.Person}
 */
function queryPerson($element){
  
  var person = GedcomX.Person();
  
  var givenName = queryPropContent($element, 'givenName'),
      familyName = queryPropContent($element, 'familyName');
  
  if(givenName || familyName){
    person.addNameFromParts({
      'http://gedcomx.org/Given': givenName,
      'http://gedcomx.org/Surname': familyName
    });
  } else {
    person.addSimpleName(queryPropContent($element, 'name'));
  }
  
  var gender = queryPropContent($element, 'gender');
  switch(gender){
    case 'male':
      person.setGender({
        type: 'http://gedcomx.org/Male'
      });
      break;
    case 'female':
      person.setGender({
        type: 'http://gedcomx.org/Female'
      });
      break;
  }
  
  person.addFact(queryEvent($element, 'birth', 'http://gedcomx.org/Birth'));
  person.addFact(queryEvent($element, 'death', 'http://gedcomx.org/Death'));
  
  return person;
}

/**
 * Get the specified event data, if it exists
 * 
 * @param {Element} $element DOM Element to search inside of
 * @param {String} event Event name
 * @param {String} type GedcomX fact type
 * @return {GedcomX.Fact}
 */
function queryEvent($element, event, type){
  var birthPlace = queryPropContent($element, [event + 'Place', 'address', 'addressLocality']);
  var birthDate = queryPropContent($element, event + 'Date');
  
  if(birthPlace || birthDate){
    var birth = GedcomX.Fact({
      type: type
    });
    
    if(birthPlace){
      birth.setPlace({
        original: birthPlace
      });
    }
    if(birthDate){
      birth.setDate({
        original: birthDate
      });
    }
    
    return birth;
  }
}

/**
 * Get the content of a schema property
 * 
 * @param {Element} $element DOM Element to search inside of
 * @param {String|Array} name Property name to search for
 * @return {String}
 */
function queryPropContent($element, name){
  var $prop = queryProp($element, name);
  return $prop ? $prop.content : '';
}

/**
 * Get the a schema property
 * 
 * @param {Element} $element DOM Element to search inside of
 * @param {String|Array} name Property name to search for
 * @return {Element}
 */
function queryProp($element, name){
  if($element){
    
    // If only one string was given then turn it into an array
    if(!Array.isArray(name)){
      name = [name];
    }
    
    var i = 0;
    do {
      $element = $element.querySelector('[itemprop="' + name[i] + '"]');
    } while (++i < name.length && $element);
    
    return $element;
  }
}

/**
 * Get all matching schema properties
 * 
 * @param {Element} $element DOM Element to search inside of
 * @param {String} name Property name to search for
 * @return {Element}
 */
function queryPropAll($element, name){
  return Array.from($element.querySelectorAll('[itemprop="' + name + '"]'));
}