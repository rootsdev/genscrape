var debug = require('debug')('fs-record'),
    utils = require('../utils');

var urls = [
  utils.urlPatternToRegex("https://familysearch.org/pal:/MM9.1.1/*"),
  utils.urlPatternToRegex("https://familysearch.org/ark:/61903/1:1:*")
];

module.exports = function(register){
  register(urls, run);
};

function run(emitter){
  debug('running');
  
  $.getJSON(window.location.href)
  .done(function(response){
    emitter.emit('data', processData(response));
  })
  .fail(function(jqxhr, text, error){
    emitter.emit('error', error);
  });
}

function processData(recordData) {
  
  // Set the name
  var nameParts = getNameParts(recordData);
  var personData = {
    'givenName': nameParts[0],
    'familyName': nameParts[1]
  };
  
  // Get the birth and death events
  var events = getEvents( recordData );
  if( events.birth ) {
    var birthDetails = getEventDetails( events.birth, 'birth' );
    personData.birthDate = birthDetails.date;
    personData.birthPlace = birthDetails.place;
  }
  if( events.death ) {
    var deathDetails = getEventDetails( events.death, 'death' );
    personData.deathDate = deathDetails.date;
    personData.deathPlace = deathDetails.place;
  }
  
  // Look for a spouse
  if( recordData.spouse.length ) {
    var spouseNameParts = utils.splitName( recordData.spouse[0].name );
    personData['spouseGivenName'] = spouseNameParts[0];
    personData['spouseFamilyName'] = spouseNameParts[1];
  }
  
  // Look for parents
  var parents = getParents( recordData );
  
  if( parents.mother ) {
    var motherNameParts = utils.splitName( parents.mother.name );
    personData['motherGivenName'] = motherNameParts[0];
    personData['motherFamilyName'] = motherNameParts[1];
  }

  if( parents.father ) {
    var fatherNameParts = utils.splitName( parents.father.name );
    personData['fatherGivenName'] = fatherNameParts[0];
    personData['fatherFamilyName'] = fatherNameParts[1];
  }
  
  debug('processed data');
  
  return personData;

}

function getEventDetails( eventInfo, eventType ) {
  var eventDetails = {};
  if( eventInfo.date ) {
    eventDetails.date = checkMultipleFields( 
      eventInfo.date, 
      [
        ['normalized', 0, 'text'],
        ['normalized', 0, 'parts', 0, 'text']
      ]
    );
  }
  if( eventInfo.place ) {
    eventDetails.place = checkMultipleFields( 
      eventInfo.place, 
      [
        ['original', 'text'],
        ['normalized', 0, 'text']
      ]
    );
  }
  return eventDetails;
}

// Check for the existence of multiple fields
// First one found is returned
function checkMultipleFields( recordData, fieldLists ) {
  for( var i in fieldLists ) {
    var data = checkFields( recordData, fieldLists[i] );
    if( data !== undefined ) return data;
  }
  return undefined;
}

function checkFields( recordData, fieldList ) {
  var data = recordData;
  for( var i in fieldList ) {
    if( data[fieldList[i]] ) {
      data = data[fieldList[i]];
    } else {
      return undefined;
    }
  }
  return data;
}

function getEvents( recordData ) {
  var events = {};
  for( var i in recordData.event ) {
    if( recordData.event[i].type == "BIRTH" ) {
      events.birth = recordData.event[i];
    } else if( recordData.event[i].type == "DEATH" ) {
      events.death = recordData.event[i];
    }
  }
  return events;
}

function getParents( recordData ) {
  var parents = {};
  for( var i in recordData.parent ) {
    if( recordData.parent[i].gender == "MALE" ) {
      parents.father = recordData.parent[i];
    } else {
      parents.mother = recordData.parent[i];
    }
  }
  return parents;
}

function getNameParts( recordData ) {
  var nameParts = [undefined, undefined];
  
  // Short circuit if there is no name on the record
  if(recordData.name.length === 0){
    return nameParts;
  }
  
  var name = checkMultipleFields( 
    recordData.name[0], 
    [
      ['normalized', 0, 'text'],
      ['normalized', 0, 'parts'],
      ['original', 'text'],
      ['original', 'parts']
    ]
  );
  
  if( typeof name == "string" ) {
    nameParts = utils.splitName(name);
  } else {
    nameParts = processFSNameParts(name);
  }
  
  return nameParts;
  
}

function processFSNameParts( parts ) {
  var given = [],
      family = [];
  for( var i in parts ) {
    if( parts[i].type == "GIVEN" ) {
      given.push( parts[i].text );
    } else if( parts[i].type == "SURNAME" ) {
      family.push( parts[i].text );
    }
  }
  return [ given.join(' '), family.join(' ') ];
}