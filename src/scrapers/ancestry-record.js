var debug = require('debug')('genscrape:scrapers:ancestry-record'),
    utils = require('../utils'),
    GedcomX = require('gedcomx-js'),
    HorizontalTable = require('../HorizontalTable'),
    VerticalTable = require('../VerticalTable');

var urls = [
  utils.urlPatternToRegex('http://search.ancestry.com/cgi-bin/sse.dll*'),
  utils.urlPatternToRegex('http://search.ancestryinstitution.com/cgi-bin/sse.dll*')
];

var eventsConfig = [
  {
    type: 'http://gedcomx.org/Birth',
    date: /^(birth year|birth date|born)$/,
    place: /^(birth ?place)$/
  },
  {
    type: 'http://gedcomx.org/Death',
    date: /^(death date|died)$/,
    place: /^(death place)$/
  },
  {
    type: 'http://gedcomx.org/Immigration',
    date: /^arrival date$/,
    place: /^port of arrival$/
  },
  {
    type: 'http://gedcomx.org/Emigration',
    date: /^departure date$/,
    place: /^port of departure/
  }
];

var factsConfig = [
  // TODO: change to use race; https://github.com/FamilySearch/gedcomx/issues/295
  {
    regex: /^(color or )race$/,
    type: 'http://gedcomx.org/Ethnicity'
  },
  {
    regex: /^ethnicity\/ nationality$/,
    type: 'http://gedcomx.org/Ethnicity'
  },
  {
    label: 'marital status',
    type: 'http://gedcomx.org/MaritalStatus'
  },
  {
    label: 'ssn',
    type: 'http://gedcomx.org/NationalId'
  }
];

module.exports = function(register){
  register(urls, setup);
};

// var alternateNamesRegex = /\[[^\[\]]*\]/g;

function setup(emitter) {
  debug('run');
  
  var dataTable, householdTable;
  
  // Parse the record table
  dataTable = new HorizontalTable(document.getElementById('recordData'), {
    rowSelector: '.tableHorizontal > tbody > tr',
    labelMapper: function(label){
      return label.toLowerCase().replace(/:$/,'');
    } 
  });
  
  // Emit `noData` event if we have no data
  if(!dataTable.hasData()) {
    debug('no data');
    emitter.emit('noData');
    return;
  }
  
  // Parse the household table, it if exists
  if(dataTable.hasLabel('household members')){
    householdTable = new VerticalTable(dataTable.getValue('household members'), {
      labelMapper: function(label){
        return label.toLowerCase();
      },
      valueMapper: function(cell){
        return cell.textContent.trim();
      }
    });
  }
  
  //
  // Process the data
  //
  
  
  var recordYear = getRecordYear();
  
  var gedx = new GedcomX(),
      primaryPerson = new GedcomX.Person({
        id: gedx.generateId()
      });
      
  gedx.addPerson(primaryPerson);
  
  // Name
  dataTable.getText('name').trim().split(/\[|\]/g).forEach(function(name){
    primaryPerson.addSimpleName(name);
  });
  
  // Split names
  var givenName = dataTable.getText('given name'),
      surname = dataTable.getText('surname');
  if(givenName || surname){
    var nameForm = GedcomX.NameForm();
    if(givenName){
      nameForm.addPart({
        type: 'http://gedcomx.org/Given',
        value: givenName
      });
    }
    if(surname){
      nameForm.addPart({
        type: 'http://gedcomx.org/Surname',
        value: surname
      });
    }
    primaryPerson.addName(GedcomX.Name().addNameForm(nameForm));
  }
  
  // Gender
  if(dataTable.hasMatch(/gender|sex/)){
    var genderType = getGender(dataTable.getMatchText(/gender|sex/));
    if(genderType){
      primaryPerson.setGender({
        type: genderType
      });
    }
  }
  
  // Events
  eventsConfig.forEach(function(config){
    var date = dataTable.getMatchText(config.date);
    var place = dataTable.getMatchText(config.place);
    if(date || place){
      var fact = GedcomX.Fact({
        type: config.type
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
      primaryPerson.addFact(fact);
    }
  });
  
  // Residence
  dataTable.getLabelsMatch(/^(home|residence) in \d{4}$/).forEach(function(homeLabel){
    var year = homeLabel.replace(/^(home|residence) in /,'');
    primaryPerson.addFact({
      type: 'http://gedcomx.org/Residence',
      date: {
        original: year,
        formal: '+' + year
      },
      place: {
        original: dataTable.getText(homeLabel)
      }
    });
  });
  
  // Simple Facts
  factsConfig.forEach(function(config){
    if(config.label && dataTable.hasLabel(config.label)){
      primaryPerson.addFact({
        type: config.type,
        value: dataTable.getText(config.label)
      });
    }
    
    else if(config.regex && dataTable.hasMatch(config.regex)){
      primaryPerson.addFact({
        type: config.type,
        value: dataTable.getMatchText(config.regex)
      });
    }
  });
  
  //
  // Family
  //
  
  // Father
  if(dataTable.hasMatch(/^father('s)?/)){
    var fathersName = dataTable.getMatchText(/^father('s)?( name)?$/);
    if(fathersName){
      var father = gedx.addRelativeFromName(primaryPerson, fathersName, 'Parent');
      if(dataTable.hasMatch(/^father('s)? (birthplace|place of birth)$/)){
        father.addFact({
          type: 'http://gedcomx.org',
          place: {
            original: dataTable.getMatchText(/^father('s)? (birthplace|place of birth)$/)
          }
        });
      }
    }
  }
  
  // Mother
  if(dataTable.hasMatch(/^mother('s)?/)){
    var mothersName = dataTable.getMatchText(/^mother('s)?( name)?$/);
    if(mothersName){
      var mother = gedx.addRelativeFromName(primaryPerson, mothersName, 'Parent');
      if(dataTable.hasMatch(/^mother('s)? (birthplace|place of birth)$/)){
        mother.addFact({
          type: 'http://gedcomx.org',
          place: {
            original: dataTable.getMatchText(/^mother('s)? (birthplace|place of birth)$/)
          }
        });
      }
    }
  }
  
  // Spouse
  if(dataTable.hasMatch(/^spouse('s)?/)){
    var spouse = GedcomX.Person({
      id: gedx.generateId()
    });
    
    if(dataTable.hasMatch(/^spouse('s)?( name)?$/)){
      spouse.addSimpleName(dataTable.getMatchText(/^spouse('s)?( name)?$/).trim());
    }
    
    if(dataTable.hasLabel('spouse gender')){
      var spouseGender = getGender(dataTable.getText('spouse gender'));
      if(spouseGender){
        spouse.setGender({
          type: spouseGender
        });
      }
    }
    
    gedx.addPerson(spouse);
    
    var coupleRel = GedcomX.Relationship({
      type: 'http://gedcomx.org/Couple',
      person1: primaryPerson,
      person2: spouse
    });
    gedx.addRelationship(coupleRel);
    
    // Marriage
    // TODO: is it possible for a event to be listed without a spouse? If so
    // then this code block won't detect it
    var marriageDate = dataTable.getText('marriage date');
    var marriagePlace = dataTable.getText('marriage place');
    if(marriageDate || marriagePlace){
      var marriage = GedcomX.Fact({
        type: 'http://gedcomx.org/Marriage'
      });
      
      if(marriageDate){
        marriage.setDate({
          original: marriageDate
        });
      }
      
      if(marriagePlace){
        marriage.setPlace({
          original: marriagePlace
        });
      }
      
      coupleRel.addFact(marriage);
    }
  }
  
  if(dataTable.hasLabel('children')){
    dataTable.getText('children').split('; ').forEach(function(name){
      gedx.addRelativeFromName(primaryPerson, name, 'Child');
    });
  }
  
  // TODO: siblings; see web obituary test; how do we detect and handle "of {PLACE}" strings?
  
  // Process household persons
  if(householdTable){
    var householdPerson;
    householdTable.getRows().forEach(function(rowData){
      
      // There's no point in processing this data if there isn't at least a name
      if(rowData.name){
        
        // Check to see if we've already added this person. Parents are often
        // explicitly listed in the data table which we process above.
        var name = GedcomX.Name.createFromString(rowData.name),
            existingPerson = gedx.findPersonByName(name);
        
        if(!existingPerson) {
          householdPerson = GedcomX.Person({
            id: gedx.generateId()
          });
          householdPerson.addSimpleName(rowData.name);
          gedx.addPerson(householdPerson);
          existingPerson = householdPerson;
        }
        
        // Primary person already has birth year extracted
        // TODO: enhance to check whether the primary person actually has
        // a birth fact; right now we're just assuming since Ancestry
        // usually calculates an estimated age for us
        if(existingPerson !== primaryPerson){
          var age = parseInt(rowData.age, 10);
          if(!isNaN(age) && recordYear){
            var estimatedBirthYear = recordYear - age;
            existingPerson.addFact({
              type: 'http://gedcomx.org',
              date: {
                original: 'about ' + estimatedBirthYear,
                formal: 'A+' + estimatedBirthYear
              }
            });
          }
        }
      }
    });
  }
  
  // Handle FamilySearch style events labeled as "Event Type","Event Date","Event Place"
  // We do this last so that we can properly attach any relationship events
  if(dataTable.hasLabel('event type')){
    var otherEventType = eventType(dataTable.getText('event type')),
        otherEventDate = dataTable.getText('event date'),
        otherEventPlace = dataTable.getText('event place');
    if(otherEventType){
      var otherEvent = GedcomX.Fact({
        type: otherEventType
      });
      if(otherEventDate){
        otherEvent.setDate({
          original: otherEventDate
        });
      }
      if(otherEventPlace){
        otherEvent.setPlace({
          original: otherEventPlace
        });
      }
      if(otherEventType === 'http://gedcomx.org/Marriage' && coupleRel){
        coupleRel.addFact(otherEvent);
      } else {
        primaryPerson.addFact(otherEvent);
      }
    }
  }
  
  // Calculate source citation and description. Add source reference to all
  // persons in the GedcomX document.
  gedx.addSourceDescriptionToAll(getSourceDescription());
  
  debug('data');
  emitter.emit('data', gedx);
}

/**
 * Create a SourceDescription for the record.
 * 
 * @returns {SourceDescription}
 */
function getSourceDescription(){
  var description = GedcomX.SourceDescription()
    .setAbout(document.location.href)
    .addTitle({value: getTitle()})
    .addCitation(getCitation());
  return description;
}

/**
 * Get a Citation for the record
 * 
 * @returns {Citation}
 */
function getCitation(){
  return {value: document.querySelector('.sourceText').textContent.replace(/\s/g,' ').trim()};
}

/**
 * Attempt to calculate a year for the record.
 * 
 * Right now it just tries to get a year (4-digit number) from the title.
 * 
 * @returns {Integer}
 */
function getRecordYear(){
  var title = getTitle();
  var matches = title.match(/\d{4}/g);
  if(matches.length === 1){
    return parseInt(matches[0], 10);
  }
}

/**
 * Get the record title
 * 
 * @returns {String}
 */
function getTitle(){
  return document.querySelector('h1').textContent.replace(/\s/g,' ').trim();
}

/**
 * Translate a string into a GedcomX gender type
 * 
 * @param {String} gender
 * @returns {String}
 */
function getGender(gender){
  switch(gender){
    case 'M':
    case 'M (Male)':
    case 'Male':
      return 'http://gedcomx.org/Male';
    case 'F':
    case 'F (Female)':
    case 'Female':
      return 'http://gedcomx.org/Female';
  }
}

/**
 * Translate a string into a GedcomX event type
 * 
 * @param {String} type
 * @returns {String}
 */
function eventType(type){
  switch(type){
    case 'Marriage':
      return 'http://gedcomx.org/Marriage';
  }
  console.log('ancestry-record: unknown event type: ' + type);
}