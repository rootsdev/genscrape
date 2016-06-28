var debug = require('debug')('genscrape:scrapers:findmypast-record'),
    utils = require('../utils'),
    GedcomX = require('gedcomx-js'),
    HorizontalTable = require('../HorizontalTable');

var urls = [
  /^http:\/\/search\.findmypast\.(co\.uk|com|ie|com\.au)\/record/
];

var simpleFacts = [
  {
    type: 'http://gedcomx.org/MaritalStatus',
    label: 'marital status'
  },
  {
    type: 'http://gedcomx.org/Occupation',
    label: 'occupation'
  }
];

module.exports = function(register){
  register(urls, run);
};

function run(emitter) {
  
  var transcriptionDisplayTable = document.getElementById('transcriptionDisplayTable');
  
  if(!transcriptionDisplayTable) {
    debug('no data table');
    emitter.emit('noData');
    return;
  }
  
  var gedx = GedcomX(),
      primaryPerson = GedcomX.Person(),
      dataFields = new HorizontalTable(transcriptionDisplayTable, {
        labelMapper: function(label){
          return label.toLowerCase();
        }
      });
      
  gedx.addPerson(primaryPerson);
  
  // Primary person's name
  primaryPerson.addNameFromParts({
    'http://gedcomx.org/Given': processName(dataFields.getText('first name(s)')),
    'http://gedcomx.org/Surname': processName(dataFields.getText('last name'))
  });
  
  // Gender
  primaryPerson.setGender(getGender(dataFields.getFirstText(['sex','gender'])));
  
  // Misc facts
  simpleFacts.forEach(function(config){
    if(dataFields.hasLabel(config.label)){
      primaryPerson.addFact({
        type: config.type,
        value: dataFields.getText(config.label)
      });
    }
  });
  
  // Vitals
  primaryPerson.addFact(getBirth(dataFields));
  primaryPerson.addFact(getDeath(dataFields));
  
  // Father
  var father = getFather(dataFields);
  if(father){
    gedx.addPerson(father);
    gedx.addRelationship({
      type: 'http://gedcomx.org/ParentChild',
      person1: father,
      person2: primaryPerson
    });
  }
  
  // Mother
  var mother = getMother(dataFields);
  if(mother){
    gedx.addPerson(mother);
    gedx.addRelationship({
      type: 'http://gedcomx.org/ParentChild',
      person1: mother,
      person2: primaryPerson
    });
  }
  
  // Spouse
  var spouse = getSpouse(dataFields),
      coupleRel;
  if(spouse){
    gedx.addPerson(spouse);
    coupleRel = GedcomX.Relationship({
      type: 'http://gedcomx.org/Couple',
      person1: primaryPerson,
      person2: spouse
    });
    gedx.addRelationship(coupleRel);
    
    // Spouse's parents
    var spousesFather = getSpousesFather(dataFields),
        spousesMother = getSpousesMother(dataFields);
    if(spousesFather){
      gedx.addPerson(spousesFather);
      gedx.addRelationship({
        type: 'http://gedcomx.org/ParentChild',
        person1: spousesFather,
        person2: spouse
      });
    }
    if(spousesMother){
      gedx.addPerson(spousesMother);
      gedx.addRelationship({
        type: 'http://gedcomx.org/ParentChild',
        person1: spousesMother,
        person2: spouse
      });
    }
  }
  
  // Marriage
  var marriage = getMarriage(dataFields);
  if(marriage){
    
    // Add marriage to the couple relationship if a spouse exists
    if(spouse){
      coupleRel.addFact(marriage);
    } 
    
    // Add marriage to the person if no couple exists
    else {
      primaryPerson.addFact(marriage);
    }
  }

  debug('data', gedx);
  emitter.emit('data', gedx);
}

function getBirth(data){
  var date = getBirthDate(data),
      place = getBirthPlace(data),
      birth;
  if(date || place){
    birth = GedcomX.Fact({
      type: 'http://gedcomx.org/Birth'
    });
    if(date){
      birth.setDate({
        original: date
      });
    }
    if(place){
      birth.setPlace({
        original: place
      });
    }
    return birth;
  }
}

function getDeath(data){
  var date = getDeathDate(data),
      place = getDeathPlace(data),
      death;
  if(date || place){
    death = GedcomX.Fact({
      type: 'http://gedcomx.org/Death'
    });
    if(date){
      death.setDate({
        original: date
      });
    }
    if(place){
      death.setPlace({
        original: place
      });
    }
    return death;
  }
}

function getMarriage(data){
  return getFact(data, 'http://gedcomx.org/Marriage', getMarriageDate, getMarriagePlace);
}

function getFact(data, type, dateFunc, placeFunc){
  var date = dateFunc(data),
      place = placeFunc(data),
      fact;
  if(date || place){
    fact = GedcomX.Fact({
      type: type
    });
    if(date){
      fact.setDate({
        original: date
      });
    }
    if(place){
      fact.setPlace({
        original: place
      });
    }
    return fact;
  }
}

function getBirthDate(data){
  var year = data.getText('birth year'),
      month = data.getText('birth month'),
      day = data.getText('birth day');
  return processDate(year, month, day);
}

function getBirthPlace(data){
  var simple = data.getFirstText(['birth place','birth state','birth county']);
  if(simple) {
    return simple;
  }
  if(data.getText('subcategory') === 'Births & baptisms') {
    return getPlace(data);
  }
}

function getDeathDate(data){
  var year = data.getText('death year'),
      month = data.getText('death month'),
      day = data.getText('death day');
  return processDate(year, month, day);
}

function getDeathPlace(data){
  var simple = data.getFirstText(['death place','death state']);
  if(simple){
    return simple;
  }
  if(data.getText('subcategory') === 'Deaths & burials'){
    return getPlace(data);
  }
}

function getMarriageDate(data){
  var year = data.getText('marriage year'),
      month = data.getText('marriage month'),
      day = data.getText('marriage day');
  return processDate(year, month, day);
}

function getMarriagePlace(data){
  var simple = data.getFirstText(['marriage place','marriage state']);
  if(simple){
    return simple;
  }
  if(data.getText('subcategory') === 'Marriages & divorces'){
    return getPlace(data);
  }
}

function getFather(data){
  return getPerson(data, 'father\'s first name(s)', 'father\'s last name');
}

function getMother(data){
  return getPerson(data, 'mother\'s first name(s)', 'mother\'s last name');
}

function getSpouse(data){
  var spouse = getPerson(data, 'spouse\'s first name(s)', 'spouse\'s last name');
  if(data.hasLabel('spouse\'s sex')){
    spouse.setGender(getGender(data.getText('spouse\'s sex')));
  }
  return spouse;
}

function getSpousesFather(data){
  return getPerson(data, 'spouse\'s father\'s first name(s)', 'spouse\'s father\'s last name');
}

function getSpousesMother(data){
  return getPerson(data, 'spouse\'s mother\'s first name(s)', 'spouse\'s mother\'s last name');
}

function getPerson(data, givenNameLabel, surnameLabel){
  var givenName = processName(data.getText(givenNameLabel)),
      surname = processName(data.getText(surnameLabel));
  if(givenName || surname){
    return GedcomX.Person().addNameFromParts({
      'http://gedcomx.org/Given': givenName,
      'http://gedcomx.org/Surname': surname
    });
  }
}

function getGender(genderText){
  var genderType;
  switch(genderText){
    case 'Male':
      genderType = 'http://gedcomx.org/Male';
      break;
    case 'Female':
      genderType = 'http://gedcomx.org/Female';
      break;
  }
  if(genderType){
    return GedcomX.Gender({
      type: genderType
    });
  }
}

/**
 * Extract the place for the record.
 * This method doesn't pay attention to whether the
 * place is for birth, marriage, death, residence, or other.
 * The method calling this needs to take care of interpreting
 * what event the place is associated with.
 */
function getPlace(data){
  var town = data.getFirstText(['place','district','town','residence town','parish']),
      county = data.getText('county'),
      state = data.getFirstText(['state','residence state']),
      country = data.getText('country');
      
  // Remove falsy values, capitalize properly, and turn into a readable string
  return [town, state, county, country].filter(function(a){
    return !!a && a !== '-';
  }).map(function(a){ 
    return utils.toTitleCase(a); 
  }).join(', ');
}

/**
 * Concatenate year,month,day if all are defined.
 * Return year if only defined.
 * Return undefined if no data.
 */
function processDate(year, month, day){
  if(year){
    if(month && day){
      return day + ' ' + month + ' ' + year;
    } else {
      return year;
    }
  }
}

/**
 * Capitalize a name properly. Ignore empty "-" values.
 */
function processName(name){
  debug('processName:' + name);
  if(!name || name === '-'){
    return;
  } else {
    return utils.toTitleCase(name);
  }
}