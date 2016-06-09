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
  }
];

var factsConfig = [
  // TODO: change to use race; https://github.com/FamilySearch/gedcomx/issues/295
  {
    label: 'race',
    type: 'http://gedcomx.org/Ethnicity'
  },
  // TODO: get date (or just year) of record
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
  
  var gedx = new GedcomX(),
      primaryPerson = new GedcomX.Person({
        id: gedx.generateId()
      });
      
  gedx.addPerson(primaryPerson);
  
  // Name
  primaryPerson.addSimpleName(dataTable.getText('name'));
  
  // Gender
  if(dataTable.hasLabel('gender')){
    var genderType, genderText = dataTable.getText('gender');
    
    switch(genderText){
      case 'Male':
        genderType = 'http://gedcomx.org/Male';
        break;
      case 'Female':
        genderType = 'http://gedcomx.org/Female';
        break;
    }
    
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
  dataTable.getLabelsMatch(/^home in \d{4}$/).forEach(function(homeLabel){
    var year = homeLabel.replace('home in ','');
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
    if(dataTable.hasLabel(config.label)){
      primaryPerson.addFact({
        type: config.type,
        value: dataTable.getText(config.label)
      });
    }
  });
  
  //
  // Family
  //
  
  // Father
  if(dataTable.hasMatch(/father('s)? /)){
    var father = gedx.addRelativeFromName(primaryPerson, dataTable.getMatchText(/father('s)? name/), 'Parent');
    if(dataTable.hasMatch(/father('s)? birthplace/)){
      father.addFact({
        type: 'http://gedcomx.org',
        place: {
          original: dataTable.getMatchText(/father('s)? birthplace/)
        }
      });
    }
  }
  
  // Mother
  if(dataTable.hasMatch(/mother('s)? /)){
    var mother = gedx.addRelativeFromName(primaryPerson, dataTable.getMatchText(/mother('s)? name/), 'Parent');
    if(dataTable.hasMatch(/mother('s)? birthplace/)){
      mother.addFact({
        type: 'http://gedcomx.org',
        place: {
          original: dataTable.getMatchText(/mother('s)? birthplace/)
        }
      });
    }
  }
  
  // Spouse
  if(dataTable.hasMatch(/spouse('s)? /)){
    var spouse = GedcomX.Person({
      id: gedx.generateId()
    });
    
    if(dataTable.hasMatch(/spouse('s)? name/)){
      spouse.addSimpleName(dataTable.getMatchText(/spouse('s)? name/));
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
  
  //
  // Family members with only a name, common in obituaries
  //
  
  if(dataTable.hasLabel('father')){
    gedx.addRelativeFromName(primaryPerson, dataTable.getText('father'), 'Parent');
  }
  
  if(dataTable.hasLabel('mother')){
    gedx.addRelativeFromName(primaryPerson, dataTable.getText('mother'), 'Parent');
  }
  
  if(dataTable.hasLabel('spouse')){
    gedx.addRelativeFromName(primaryPerson, dataTable.getText('spouse'), 'Couple');
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
        }
        
        // TODO: process age
        // We can't do this until we come up with a method for calculating
        // the date of the document/event
        
      }
    });
  }
  
  debug('data');
  emitter.emit('data', gedx);
}