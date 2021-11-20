var debug = require('debug')('genscrape:scrapers:wikitree'),
    utils = require('../utils'),
    GedcomX = require('gedcomx-js'),
    schema = require('../schema');

var urls = [
  utils.urlPatternToRegex('https://www.wikitree.com/wiki/*-*')
];

module.exports = function(register){
  register(urls, run);
};

var prefixes = [
  'dr',
  'dr.',
  'president',
  'general'
];

var suffixes = [
  'jr',
  'jr.',
  'sr',
  'sr.',
  'iii'
];

/**
 * Called when the URL matches.
 */
function run(emitter) {
  
  debug('run');
  
  var $schemaPersons = Array.from(schema.queryItemAll(document, 'http://schema.org/Person'));
  
  debug('persons: ' + $schemaPersons.length);
  
  if($schemaPersons.length){
    
    var gedx = GedcomX(),
        primaryPerson = processPrimaryPerson($schemaPersons.shift());
        
    primaryPerson.setPrincipal(true);
    primaryPerson.setId(getRecordId(document.location.href));
    primaryPerson.setIdentifiers({
      'genscrape': getRecordIdentifier(document.location.href)
    });
    gedx.addPerson(primaryPerson);
    
    $schemaPersons.forEach(function($relative){
      var relative = processPerson($relative);
      if(relative){
        gedx.addPerson(relative);
        switch($relative.getAttribute('itemprop')) {
          
          case 'parent':
            gedx.addRelationship({
              type: 'http://gedcomx.org/ParentChild',
              person1: relative,
              person2: primaryPerson
            });
            break;
            
          case 'spouse':
            gedx.addRelationship({
              type: 'http://gedcomx.org/Couple',
              person1: primaryPerson,
              person2: relative
            });
            // TODO: get marriage date and place
            break;
            
          case 'children':
            gedx.addRelationship({
              type: 'http://gedcomx.org/ParentChild',
              person1: primaryPerson,
              person2: relative
            });
            break;
        }
      }
    });
    
    // Agent
    gedx.addAgent(GedcomX.Agent()
      .setId('agent')
      .addName({
        lang: 'en',
        value: 'WikiTree'
      })
      .setHomepage({
        resource: 'https://www.wikitree.com'
      }));
    
    // SourceDescription
    gedx.addSourceDescriptionToAll({
      about: document.location.href,
      titles: [
        {
          value: document.title
        }
      ],
      citations: [
        {
          value: document.title + ' (' + window.document.location.href 
            + ' : accessed ' + utils.getDateString() + ')'
        }
      ],
      repository: {
        resource: '#agent'
      }
    });
    
    emitter.emit('data', gedx);
  }
  
  else {
    emitter.emit('noData');
  }
  
}

/**
 * Process the schema.org data of the primary person and return a GedcomX.Person
 * 
 * @param {Element} $person
 * @return {GedcomX.Person}
 */
function processPrimaryPerson($person){
  var person = GedcomX.Person().addNameFromParts({
    'http://gedcomx.org/Prefix': utils.maybe(schema.queryProp($person, 'honorificPrefix')).textContent,
    'http://gedcomx.org/Given': utils.maybe(schema.queryProp($person, 'givenName')).textContent,
    'http://gedcomx.org/Surname': schema.queryPropContent($person, 'familyName'),
    'http://gedcomx.org/Suffix': utils.maybe(schema.queryProp($person, 'honorificSuffix')).textContent
  });
  
  var gender = schema.queryPropContent($person, 'gender');
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
  
  person.addFact(processEvent($person, 'birth', 'http://gedcomx.org/Birth'));
  person.addFact(processEvent($person, 'death', 'http://gedcomx.org/Death'));
  
  return person;
}

/**
 * Process the schema.org data of a related person and return a GedcomX.Person
 * 
 * @param {Element} $person
 * @return {GedcomX.Person}
 */
function processPerson($person){
  var $name = schema.queryProp($person, 'name'),
      name = $name ? $name.textContent : null,
      url = $person.querySelector('a').href;
  if(name){
    var person = GedcomX.Person({
      id: getRecordId(url),
      identifiers: {
        'genscrape': getRecordIdentifier(url)
      }
    });
    processName(person, name);
    return person;
  }
}

/**
 * Get the specified event data, if it exists
 * 
 * @param {Element} $element DOM Element to search inside of
 * @param {String} event Event name
 * @param {String} type GedcomX fact type
 * @return {GedcomX.Fact}
 */
function processEvent($element, event, type){
  var $birthPlace = schema.queryProp($element, event + 'Place');
  var $birthAddress = $birthPlace ? schema.queryProp($birthPlace, 'address') : null;
  var $birthDate = schema.queryProp($element, event + 'Date');
  
  if($birthAddress || $birthDate){
    var birth = GedcomX.Fact({
      type: type
    });
    
    if($birthAddress){
      birth.setPlace({
        original: $birthAddress.textContent
      });
    }
    if($birthDate){
      birth.setDate({
        original: $birthDate.textContent
      });
    }
    
    return birth;
  }
}

/**
 * Split a name into parts
 * 
 * TODO: request that wikitree specify the name parts in the schema.org data
 * 
 * @param {GedcomX.Person} person
 * @param {String} name
 * @return {GedcomX.Name}
 */
function processName(person, name){
  var partsList = name.split(' '),
      prefix, potentialPrefix,
      suffix, potentialSuffix,
      givenName, familyName, maidenName,
      i;
  
  // Check for a prefix
  potentialPrefix = partsList[0].toLowerCase();
  for(i = 0; i < prefixes.length; i++){
    if(prefixes[i] === potentialPrefix){
      prefix = partsList.shift();
      break;
    }
  }
  
  // Check for a suffix
  potentialSuffix = partsList[partsList.length - 1].toLowerCase();
  for(i = 0; i < suffixes.length; i++){
    if(suffixes[i] === potentialSuffix){
      suffix = partsList.pop();
      break;
    }
  }
  
  // Check for a maiden name
  for(i = 0; i < partsList.length; i++){
    if(/^\([^)]+\)$/.test(partsList[i])){
      
      // Remove leading and trailing ()
      maidenName = partsList[i].slice(1, -1);
      
      // Remove the name from the list
      partsList.splice(i, 1);
      
      break;
    }
  }
  
  // At this point we have a list of given name and family names. We don't know
  // how many we have of each. The best assumption we can make is that if there
  // is more than one name then the last one will be a family name and all others
  // are given names. It will often fail, but any other method will fail more.
  
  // If there are no names left then do nothing.
  // This code is useless except for its ability to document that we are
  // intentionally doing nothing.
  if(partsList.length === 0){
    
  }
  
  // If there's one name then assume it's a given name
  else if(partsList.length === 1){
    givenName = partsList[0];
  }
  
  // We have more than one name left so assume the last one is a family name
  else {
    familyName = partsList.pop();
    givenName = partsList.join(' ');
  }
  
  // Now we're ready to assemble names
  if(maidenName){
    person.addNameFromParts({
      'http://gedcomx.org/Prefix': prefix,
      'http://gedcomx.org/Given': givenName,
      'http://gedcomx.org/Surname': maidenName,
      'http://gedcomx.org/Suffix': suffix
    });
  }
  
  person.addNameFromParts({
    'http://gedcomx.org/Prefix': prefix,
    'http://gedcomx.org/Given': givenName,
    'http://gedcomx.org/Surname': familyName,
    'http://gedcomx.org/Suffix': suffix
  });
  
}

/**
 * Get the record ID
 * 
 * @param {String} url
 * @return {String}
 */
function getRecordId(url) {
  return url.split('/').pop();
}

/**
 * Get a record's identifier
 * 
 * @param {String} url
 * @return {String}
 */
function getRecordIdentifier(url) {
  return 'genscrape://wikitree/person:' + getRecordId(url);
}