var debug = require('debug')('genscrape:scrapers:findmypast-tree'),
    utils = require('../utils'),
    GedcomX = require('gedcomx-js');

var urls = [
  /^http:\/\/tree\.findmypast\.(co\.uk|com|ie|com\.au)/
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

function processHash(emitter){
  debug('processHash');
  
  var urlParts = window.location.hash.split('/'),
      treeId = urlParts[2],
      // We convert the personId into an integer so that we can do strict comparisons
      // on the response data from the API.
      personId = parseInt(urlParts[3], 10);
      
   debug('hash: ' + window.location.hash);
   debug('treeId: ' + treeId);
   debug('personId: ' + personId);
      
  if(personId){
    getRelations(treeId, personId, function(error, data){
      if(error){
        emitter.emit('error', error);
      }
      else if(data && data.Object){
        debug('relations data');
        emitter.emit('data', processData(treeId, personId, data.Object));
      } 
      else {
        emitter.emit('noData');
        debug('no relation Object');
      }
    });
  }
  
  else {
    emitter.emit('noData');
    debug('not focused on a person');
  }
  
}

/**
 * Convert the API data into GedcomX data.
 * 
 * @param {String} treeId - ID of the tree 
 * @param {String} personId - ID if the primary person
 * @param {Object} data - The "Object" portion of the API response
 * @returns {GedcomX}
 */
function processData(treeId, personId, data){
  var relations = new Relations(data, treeId),
      gedx = new GedcomX(),
      primaryPerson = relations.getGedxPerson(personId);
  
  primaryPerson.setPrincipal(true); 
  gedx.addPerson(primaryPerson);
  
  // Spouses
  relations.getFamilies(personId).forEach(function(family){
    var spouseId = family.FatherId === personId ? family.MotherId : family.FatherId,
        spouse = relations.getGedxPerson(spouseId);
    gedx.addPerson(spouse);
    var relationship = GedcomX.Relationship({
      type: 'http://gedcomx.org/Couple',
      person1: primaryPerson,
      person2: spouse
    });
    if(family.MarriageDate || family.MarriagePlace){
      var marriage = GedcomX.Fact({
        type: 'http://gedcomx.org/Marriage'
      })
      .setDate(gedxDate(family.MarriageDate));
      if(family.MarriagePlace){
        marriage.setPlace({
          original: family.MarriagePlace
        });
      }
      relationship.addFact(marriage);
    }
    gedx.addRelationship(relationship);
    
    // Children
    relations.getChildren(family.Id).forEach(function(childRef){
      var child = relations.getGedxPerson(childRef.ChildId);
      gedx.addPerson(child);
      gedx.addRelationship({
        type: 'http://gedcomx.org/ParentChild',
        person1: primaryPerson,
        person2: child
      });
      gedx.addRelationship({
        type: 'http://gedcomx.org/ParentChild',
        person1: spouse,
        person2: child
      });
    });
  });
  
  // Parents
  relations.getChildRefs(personId).map(function(childRef){
    return relations.getFamily(childRef.FamilyId);
  }).forEach(function(family){
    var father = relations.getGedxPerson(family.FatherId),
        mother = relations.getGedxPerson(family.MotherId);
    gedx.addPerson(father);
    gedx.addPerson(mother);
    gedx.addRelationship({
      type: 'http://gedcomx.org/Couple',
      person1: father,
      person2: mother
    });
    gedx.addRelationship({
      type: 'http://gedcomx.org/ParentChild',
      person1: father,
      person2: primaryPerson
    });
    gedx.addRelationship({
      type: 'http://gedcomx.org/ParentChild',
      person1: mother,
      person2: primaryPerson
    });
    
    // Siblings
    relations.getChildren(family.Id).forEach(function(childRef){
      if(childRef.ChildId === personId){
        return;
      }
      
      var child = relations.getGedxPerson(childRef.ChildId);
      gedx.addPerson(child);
      gedx.addRelationship({
        type: 'http://gedcomx.org/ParentChild',
        person1: father,
        person2: child
      });
      gedx.addRelationship({
        type: 'http://gedcomx.org/ParentChild',
        person1: mother,
        person2: child
      });
    });
  });
  
  // Agent
  var agent = GedcomX.Agent()
    .setId('agent')
    .addName({
      lang: 'en',
      value: 'findmypast'
    })
    .setHomepage({
      resource: 'http://www.findmypast' + utils.getDomain()
    });
  gedx.addAgent(agent);
  
  // Source Description
  var fullNameText = primaryPerson.getNames()[0].getNameForms()[0].getFullText();
  var sourceDescription = GedcomX.SourceDescription()
    .setAbout(window.document.location.href)
    .addTitle({
      value: fullNameText + ' - ' + data.Title + ' - findmypast Family Tree'
    })
    .addCitation({
      value: '"' + data.Title + ' - findmypast Family Tree" (' + window.document.location.href
        + ' : accessed ' + utils.getDateString() + '), profile for ' + fullNameText + '.'
    })
    .setRepository({
      resource: '#agent'
    });
  gedx.addSourceDescriptionToAll(sourceDescription);
  
  return gedx;
}

/**
 * Convert a findmypast person to a GedcomX person
 * 
 * @param {Object} person
 * @param {string} treeId
 * @returns {GedcomX.Person}
 */
function processPerson(person, treeId){
  var gedxPerson = GedcomX.Person()
    .setId(person.Id + '')
    .setIdentifiers({
      'genscrape': 'genscrape://findmypast:tree/' + treeId + ':person:' + person.Id
    })
    .setGender({
      type: person.Gender === 1 ? 'http://gedcomx.org/Male' : 'http://gedcomx.org/Female'
    })
    .addNameFromParts({
      'http://gedcomx.org/Given': person.GivenNames,
      'http://gedcomx.org/Surname': person.Surnames
    });
    
  if(person.BirthDate || person.BirthPlace){
    var birth = GedcomX.Fact({
      type: 'http://gedcomx.org/Birth'
    })
    .setDate(gedxDate(person.BirthDate));
    if(person.BirthPlace){
      birth.setPlace({
        original: person.BirthPlace
      });
    }
    gedxPerson.addFact(birth);
  }
  
  if(person.DeathDate || person.DeathPlace){
    var death = GedcomX.Fact({
      type: 'http://gedcomx.org/Death'
    })
    .setDate(gedxDate(person.DeathDate));
    if(person.DeathPlace){
      death.setPlace({
        original: person.DeathPlace
      });
    }
    gedxPerson.addFact(death);
  }
  
  return gedxPerson;
}

/**
 * Get the ProfileRelations data from the tree api
 */
function getRelations(treeId, personId, callback){
  return api(treeId, 'api/familytree/getfamilytree?familytreeview=ProfileRelations&personId=' + personId, callback);
}

/**
 * Proxy API Request
 */
function api(treeId, url, callback){
  debug('api request: ' + url);
  utils.getJSON('/api/proxy/get?url=' + encodeURIComponent(url), {
    'Family-Tree-Ref': treeId
  }, callback);
}

/**
 * Calculate the proper domain ending: .co.uk, .com, .ie, .com.au
 * 
 * @return {String}
 */
function getDomain(){
  return '.' + document.location.host.split('.').slice(2).join('.');
}

/**
 * Convert a findmypast date integer of form 19260504
 * into a date string of form 1926-05-04.
 * 
 * @param {Integer} date
 * @returns {String}
 */
function convertDate(dateInt){
  if(dateInt){
    var dateString = '' + dateInt,
        year = dateString.substr(0, 4),
        month = dateString.substr(4, 2),
        day = dateString.substr(6, 2);
        
    if(month === '00' || day === '00'){
      return year;
    } else {
      return year + '-' + month + '-' + day;
    }
  }
}

/**
 * Convert a findmypast date integer into a GedcomX.Date object
 * 
 * @param {Integer} date
 * @returns {GedcomX.Date}
 */
function gedxDate(dateInt){
  if(dateInt){
    var dateString = convertDate(dateInt);
    return GedcomX.Date({
      original: dateString,
      formal: '+' + dateString 
    });
  }
}

/**
 * Object that simplifies access of ProfileRelations API response data
 */
var Relations = function(data, treeId){
  this.data = data;
  this.treeId = treeId;
  this.gedxPersons = {};
};

Relations.prototype.getPerson = function(personId){
  return utils.find(this.data.Persons, function(person){
    return person.Id === personId;
  });
};

Relations.prototype.getGedxPerson = function(personId){
  if(!this.gedxPersons[personId]){
    var personData = this.getPerson(personId),
        person = processPerson(personData, this.treeId);
    this.gedxPersons[personId] = person;
  }
  return this.gedxPersons[personId];
};

Relations.prototype.getFamily = function(familyId){
  return utils.find(this.data.Familys, function(family){
    return family.Id === familyId;
  });
};

Relations.prototype.getFamilies = function(personId){
  return this.data.Familys.filter(function(family){
    return family.FatherId === personId || family.MotherId === personId;
  });
};

Relations.prototype.getChildren = function(familyId){
  return this.data.Childs.filter(function(child){
    return child.FamilyId === familyId;
  });
};

Relations.prototype.getChildRefs = function(personId){
  return this.data.Childs.filter(function(child){
    return child.ChildId === personId;
  });
};