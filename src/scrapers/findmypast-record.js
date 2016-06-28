var debug = require('debug')('genscrape:scrapers:findmypast-record'),
    utils = require('../utils'),
    GedcomX = require('gedcomx-js'),
    HorizontalTable = require('../HorizontalTable'),
    VerticalTable = require('../VerticalTable');

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
    var text = dataFields.getText(config.label);
    if(text && text !== '-'){
      primaryPerson.addFact({
        type: config.type,
        value: dataFields.getText(config.label)
      });
    }
  });
  
  // Vitals
  primaryPerson.addFact(getBirth(dataFields));
  primaryPerson.addFact(getDeath(dataFields));
  primaryPerson.addFact(getBurial(dataFields));
  primaryPerson.addFact(getBaptism(dataFields));
  
  // Household
  var individualsTable = document.getElementById('individuals'),
      primaryRelationship = dataFields.getText('relationship'),
      siblings = [],
      head, headsWife, householdData;
  if(individualsTable){
    householdData = new VerticalTable(individualsTable, {
      rowSelector: 'tr:not(.highlight-individual)', // Skip primary person
      labelMapper: function(label){
        return label.toLowerCase();
      },
      valueMapper: function(cell){
        var text = cell.textContent;
        return text && text !== '-' ? text : undefined;
      }
    });
    householdData.getRows().forEach(function(row){
      var householdPerson = getHouseholdPerson(row);
      gedx.addPerson(householdPerson);
      if(row['relationship'] === 'Self'){
        row['relationship'] = 'Head';
      }
      switch(primaryRelationship + ':' + row['relationship']){
        case 'Head:Wife':
        case 'Wife:Head':
          gedx.addRelationship({
            type: 'http://gedcomx.org/Couple',
            person1: primaryPerson,
            person2: householdPerson
          });
          break;
        case 'Head:Daughter':
        case 'Head:Son':
          gedx.addRelationship({
            type: 'http://gedcomx.org/ParentChild',
            person1: primaryPerson,
            person2: householdPerson
          });
          break;
        case 'Daughter:Head':
        case 'Son:Head':
          head = householdPerson;
          gedx.addRelationship({
            type: 'http://gedcomx.org/ParentChild',
            person1: householdPerson,
            person2: primaryPerson
          });
          break;
        case 'Son:Son':
        case 'Son:Daughter':
        case 'Daughter:Son':
        case 'Daughter:Daughter':
          siblings.push(householdPerson);
          break;
        case 'Son:Wife':
        case 'Daughter:Wife':
          headsWife = householdPerson;
          break;
      }
    });
    if(head){
      siblings.forEach(function(sibling){
        gedx.addRelationship({
          type: 'http://gedcomx.org/ParentChild',
          person1: head,
          person2: sibling
        });
      });
    }
    if(head && headsWife){
      gedx.addRelationship({
        type: 'http://gedcomx.org/Couple',
        person1: head,
        person2: headsWife
      });
    }
  }
  
  // If a census household table isn't listed then look for relationship info
  // in the record details. We don't do both because relationships may be
  // listed in both which leads to duplicate info.
  else {
  
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
  
  }
  
  // TODO: Immigration and naturalization
  
  // TODO: SourceDescription

  debug('data', gedx);
  emitter.emit('data', gedx);
}

function getBirth(data){
  return getFact(data, 'http://gedcomx.org/Birth', getBirthDate, getBirthPlace);
}

function getBaptism(data){
  var baptism = getFact(data, 'http://gedcomx.org/Baptism', getBaptismDate, getBaptismPlace);
  
  // Only return the baptism if a date is set. We do this because otherwise a
  // baptism fact will be generated for all records in the "Births & baptisms"
  // category. We can reasonably assume that actual baptism records will have
  // a baptism date.
  if(baptism && baptism.getDate()){
    return baptism;
  }
}

function getDeath(data){
  return getFact(data, 'http://gedcomx.org/Death', getDeathDate, getDeathPlace);
}

function getBurial(data){
  return getFact(data, 'http://gedcomx.org/Burial', getBurialDate, function(data){
    // TODO: no example of a burial place
  });
}

function getMarriage(data){
  return getFact(data, 'http://gedcomx.org/Marriage', getMarriageDate, getMarriagePlace);
}

function getFact(data, type, dateFunc, placeFunc){
  var date = dateFunc(data),
      place = placeFunc(data),
      fact;
  if(date === '-'){
    date = undefined;
  }
  if(place === '-'){
    place = undefined;
  }
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

function getBaptismDate(data){
  return processDate(
    data.getText('baptism year'),
    data.getText('baptism month'),
    data.getText('baptism day')
  );
}

function getBaptismPlace(data){
  var simple = data.getText('baptism place');
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

function getBurialDate(data){
  return processDate(
    data.getText('burial year'), 
    data.getText('burial month'), 
    data.getText('burial day')
  );
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
  return getPerson(data, 'father\'s first name(s)', 'father\'s last name')
    || getPerson(data, 'groom\'s father\'s first name(s)', 'groom\'s father\'s last name');
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
  return getPerson(data, 'spouse\'s father\'s first name(s)', 'spouse\'s father\'s last name')
    || getPerson(data, 'bride\'s father\'s first name(s)', 'bride\'s father\'s last name');
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

function getHouseholdPerson(data){
  var person = GedcomX.Person();
  person.addNameFromParts({
    'http://gedcomx.org/Given': data['first name(s)'],
    'http://gedcomx.org/Surname': data['last name']
  });
  person.setGender(getGender(data['sex'] || data['gender']));
  if(data['birth year'] || data['birth place']){
    var birth = GedcomX.Fact({
      type: 'http://gedcomx.org/Birth'
    });
    if(data['birth year']){
      birth.setDate({
        original: data['birth year']
      });
    }
    if(data['birth place']){
      birth.setPlace({
        original: data['birth place']
      });
    }
  }
  if(data['occupation']){
    person.addFact({
      type: 'http://gedcomx.org/Occupation',
      value: data['occupation']
    });
  }
  if(data['marital status']){
    person.addFact({
      type: 'http://gedcomx.org/MaritalStatus',
      value: data['marital status']
    });
  }
  return person;
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
  if(year === '-'){
    year = undefined;
  }
  if(month === '-'){
    month = undefined;
  }
  if(day === '-'){
    day = undefined;
  }
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