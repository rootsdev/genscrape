var debug = require('debug')('genscrape:scrapers:ancestry-record'),
    utils = require('../utils'),
    GedcomX = require('gedcomx-js'),
    HorizontalTable = require('../HorizontalTable'),
    VerticalTable = require('../VerticalTable');

var urls = [
  utils.urlPatternToRegex('http://search.ancestry.com/cgi-bin/sse.dll*'),
  utils.urlPatternToRegex('http://search.ancestryinstitution.com/cgi-bin/sse.dll*')
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
  
  // Birth
  var birthDate = dataTable.getMatchText(/^(birth year|birth date|born)$/);
  var birthPlace = dataTable.getMatchText(/^(birth ?place)$/);
  if(birthDate || birthPlace){
    var birth = GedcomX.Fact({
      type: 'http://gedcomx.org/Birth'
    });
    
    if(birthDate){
      birth.setDate({
        original: birthDate
      });
    }
    
    if(birthPlace){
      birth.setPlace({
        original: birthPlace
      });
    }
    
    primaryPerson.addFact(birth);
  }
  
  // Death
  var deathDate = dataTable.getMatchText(/^(death date|died)$/);
  var deathPlace = dataTable.getMatchText(/^(death place)$/);
  if(deathDate || deathPlace){
    var death = GedcomX.Fact({
      type: 'http://gedcomx.org/Death'
    });
    
    if(deathDate){
      death.setDate({
        original: deathDate
      });
    }
    
    if(deathPlace){
      death.setPlace({
        original: deathPlace
      });
    }
    
    primaryPerson.addFact(death);
  }
  
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
  
  // Race
  // TODO: change to use race; https://github.com/FamilySearch/gedcomx/issues/295
  if(dataTable.hasLabel('race')){
    primaryPerson.addFact({
      type: 'http://gedcomx.org/Ethnicity',
      value: dataTable.getText('race')
    });
  }
  
  // Marital Status
  // TODO: get date (or just year) of record
  if(dataTable.hasLabel('marital status')){
    primaryPerson.addFact({
      type: 'http://gedcomx.org/MaritalStatus',
      value: dataTable.getText('marital status')
    });
  }
  
  // SSN
  if(dataTable.hasLabel('ssn')){
    primaryPerson.addFact({
      type: 'http://gedcomx.org/NationalId',
      value: dataTable.getText('ssn')
    });
  }
  
  //
  // Family
  //
  
  // Father
  if(dataTable.hasMatch(/father('s)? /)){
    var father = GedcomX.Person({
      id: gedx.generateId()
    });
    
    if(dataTable.hasMatch(/father('s)? name/)){
      father.addSimpleName(dataTable.getMatchText(/father('s)? name/));
    }
    
    if(dataTable.hasMatch(/father('s)? birthplace/)){
      father.addFact({
        type: 'http://gedcomx.org',
        place: {
          original: dataTable.getMatchText(/father('s)? birthplace/)
        }
      });
    }
    
    gedx.addPerson(father);
    
    gedx.addRelationship({
      type: 'http://gedcomx.org/ParentChild',
      person1: {
        resource: '#' + father.getId()
      },
      person2: {
        resource: '#' + primaryPerson.getId()
      }
    });
  }
  
  // Mother
  if(dataTable.hasMatch(/mother('s)? /)){
    var mother = GedcomX.Person({
      id: gedx.generateId()
    });
    
    if(dataTable.hasMatch(/mother('s)? name/)){
      mother.addSimpleName(dataTable.getMatchText(/mother('s)? name/));
    }
    
    if(dataTable.hasMatch(/mother('s)? birthplace/)){
      mother.addFact({
        type: 'http://gedcomx.org',
        place: {
          original: dataTable.getMatchText(/mother('s)? birthplace/)
        }
      });
    }
    
    gedx.addPerson(mother);
    
    gedx.addRelationship({
      type: 'http://gedcomx.org/ParentChild',
      person1: {
        resource: '#' + mother.getId()
      },
      person2: {
        resource: '#' + primaryPerson.getId()
      }
    });
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
      person1: {
        resource: '#' + primaryPerson.getId()
      },
      person2: {
        resource: '#' + spouse.getId()
      }
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
    var father = GedcomX.Person({
      id: gedx.generateId()
    }).addSimpleName(dataTable.getText('father'));
    gedx.addPerson(father);
    gedx.addRelationship({
      type: 'http://gedcomx.org/ParentChild',
      person1: {
        resource: '#' + father.getId()
      },
      person2: {
        resource: '#' + primaryPerson.getId()
      }
    });
  }
  
  if(dataTable.hasLabel('mother')){
    var mother = GedcomX.Person({
      id: gedx.generateId()
    }).addSimpleName(dataTable.getText('mother'));
    gedx.addPerson(mother);
    gedx.addRelationship({
      type: 'http://gedcomx.org/ParentChild',
      person1: {
        resource: '#' + mother.getId()
      },
      person2: {
        resource: '#' + primaryPerson.getId()
      }
    });
  }
  
  if(dataTable.hasLabel('spouse')){
    var spouse = GedcomX.Person({
      id: gedx.generateId()
    }).addSimpleName(dataTable.getText('spouse'));
    gedx.addPerson(spouse);
    gedx.addRelationship({
      type: 'http://gedcomx.org/Couple',
      person2: {
        resource: '#' + spouse.getId()
      },
      person1: {
        resource: '#' + primaryPerson.getId()
      }
    });
  }
  
  if(dataTable.hasLabel('children')){
    dataTable.getText('children').split('; ').forEach(function(name){
      var child = GedcomX.Person({
        id: gedx.generateId()
      }).addSimpleName(name);
      gedx.addPerson(child);
      gedx.addRelationship({
        type: 'http://gedcomx.org/ParentChild',
        person1: {
          resource: '#' + primaryPerson.getId()
        },
        person2: {
          resource: '#' + child.getId()
        }
      });
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