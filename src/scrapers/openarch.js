var debug = require('debug')('genscrape:scrapers:openarch'),
    utils = require('../utils'),
    GedcomX = require('gedcomx-js'),
    schema = require('../schema');

var urls = [
  utils.urlPatternToRegex("https://www.openarch.nl/show*")
];

module.exports = function(register){
  register(urls, run);
};

function run(emitter){
  
  var $record = schema.queryItem(document, 'http://historical-data.org/HistoricalRecord'),
      $schemaPersons = Array.from(schema.queryItemAll(document, 'http://schema.org/Person'));

  debug('persons: ' + $schemaPersons.length);
  
  // Do we have a historical record and at least one person?
  if ($record && $schemaPersons.length) {
  
    var gedx = new GedcomX();
    var recordType = schema.queryPropContent($record, 'type');
    
    debug('recordType: ' + recordType);
    
    switch(recordType){
      
      // Marriage (2 persons, possible both with parents)
      case 'BS Huwelijk':
      case 'DTB Trouwen':
        processCoupleEvent(gedx, $record, $schemaPersons);
        break;
      
		// Baptism, Birth, Burial, Death (1 person, possible with parents)
      case 'DTB Dopen':
      case 'BS Geboorte':
      case 'DTB Begraven':
      case 'BS Overlijden':
		processPersonEvent(gedx, $record, $schemaPersons);
        break;
      
      // Just process the first person
      default:
        var primaryPerson = queryPerson($schemaPersons[0]);
        primaryPerson.setPrincipal(true);
        gedx.addPerson(primaryPerson);
        break;
    }
    
    // SourceDescription
    var title = schema.queryPropContent($record, 'name');
    gedx.addSourceDescriptionToAll({
      about: document.location.href,
      titles: [
        {
          value: title
        }
      ],
      citations: [
        {
          value: title + ' (' + window.document.location.href 
            + ' : accessed ' + utils.getDateString() + ')'
        }
      ]
    });
  
    emitter.emit('data', gedx);
  } else {
    emitter.emit('noData');
  }
}

/**
 * Process a marriage record.
 * 
 * @param {GedcomX} gedx
 * @param {Element} $record The itemtype="http://historical-data.org/HistoricalRecord" element
 * @param {Element[]} $schemaPersona Array of itemtype="http://schema.org/Person"
 */
function processCoupleEvent(gedx, $record, $schemaPersons){
  
  // Persons are listed in the DOM in order that the vars are declared below.
  // We account for the possibility that the parents of either the groom or
  // the groom may be missing.
  
  var groomsFather, groomsMother, groom, bride, bridesFather, bridesMother;
  
  if($schemaPersons[0].getAttribute('itemprop') === 'parent'){
    groomsFather = queryPerson($schemaPersons.shift());
  }
  if($schemaPersons[0].getAttribute('itemprop') === 'parent'){
    groomsMother = queryPerson($schemaPersons.shift());
  }
  groom = queryPerson($schemaPersons.shift());
  bride = queryPerson($schemaPersons.shift());
  if($schemaPersons[0].getAttribute('itemprop') === 'parent'){
    bridesFather = queryPerson($schemaPersons.shift());
  }
  if($schemaPersons[0].getAttribute('itemprop') === 'parent'){
    bridesMother = queryPerson($schemaPersons.shift());
  }
  
  gedx.addPerson(groom);
  
  if(groomsFather){
    gedx.addPerson(groomsFather);
    gedx.addRelationship({
      type: 'http://gedcomx.org/ParentChild',
      person1: groomsFather,
      person2: groom
    });
  }
  
  if(groomsMother){
    gedx.addPerson(groomsMother);
    gedx.addRelationship({
      type: 'http://gedcomx.org/ParentChild',
      person1: groomsMother,
      person2: groom
    });
  }
  
  gedx.addPerson(bride);
  var couple = GedcomX.Relationship({
    type: 'http://gedcomx.org/Couple',
    person1: groom,
    person2: bride
  });
  var marriageDate = schema.queryPropContent($record, 'date');
  if(marriageDate){
    couple.addFact({
      type: 'http://gedcomx.org/Marriage',
      date: {
        original: marriageDate,
      }
    });
  }
  gedx.addRelationship(couple);
  
  if(bridesFather){
    gedx.addPerson(bridesFather);
    gedx.addRelationship({
      type: 'http://gedcomx.org/ParentChild',
      person1: bridesFather,
      person2: groom
    });
  }
  
  if(bridesMother){
    gedx.addPerson(bridesMother);
    gedx.addRelationship({
      type: 'http://gedcomx.org/ParentChild',
      person1: bridesMother,
      person2: groom
    });
  }
}

/**
 * Process a baptism record.
 * 
 * @param {GedcomX} gedx
 * @param {Element} $record The itemtype="http://historical-data.org/HistoricalRecord" element
 * @param {Element[]} $schemaPersona Array of itemtype="http://schema.org/Person"
 */
function processPersonEvent(gedx, $record, $schemaPersons){
  
  var father, mother, child;
  
  if($schemaPersons[0].getAttribute('itemprop') === 'parent'){
    father = queryPerson($schemaPersons.shift());
  }
  if($schemaPersons[0].getAttribute('itemprop') === 'parent'){
    mother = queryPerson($schemaPersons.shift());
  }
  child = queryPerson($schemaPersons.shift());
  
  child.setPrincipal(true);
  gedx.addPerson(child);
  
  if(father){
    gedx.addPerson(father);
    gedx.addRelationship({
      type: 'http://gedcomx.org/ParentChild',
      person1: father,
      person2: child
    });
  }
  
  if(mother){
    gedx.addPerson(mother);
    gedx.addRelationship({
      type: 'http://gedcomx.org/ParentChild',
      person1: mother,
      person2: child
    });
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
  
  var givenName = schema.queryPropContent($element, 'givenName'),
      familyName = schema.queryPropContent($element, 'familyName');
  
  if(givenName || familyName){
    person.addNameFromParts({
      'http://gedcomx.org/Given': givenName,
      'http://gedcomx.org/Surname': familyName
    });
  } else {
    person.addSimpleName(schema.queryPropContent($element, 'name'));
  }
  
  var gender = schema.queryPropContent($element, 'gender');
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
  var birthPlace = schema.queryPropContent($element, event + 'Place');
  var birthDate = schema.queryPropContent($element, event + 'Date');
  
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