var debug = require('debug')('genscrape:scrapers:findmypast-tree'),
    utils = require('../../utils'),
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
        emitter.emit('data', processData(personId, data.Object));
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
 * @param {String} personId - ID if the primary person
 * @data {Object} data - The "Object" portion of the API response
 * @returns {GedcomX}
 */
function processData(personId, data){
  var relations = new Relations(data),
      gedx = new GedcomX(),
      primaryPerson = processPerson(relations.getPerson(personId));
      
  gedx.addPerson(primaryPerson);
  
  // Spouses
  var families = relations.getFamilies(personId);
  families.forEach(function(family){
    var spouseId = family.FatherId === personId ? family.MotherId : family.FatherId,
        spouse = processPerson(relations.getPerson(spouseId));
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
  });
  
  return gedx;
}

/**
 * Convert a findmypast person to a GedcomX person
 * 
 * @param {Object} person
 * @returns {GedcomX.Person}
 */
function processPerson(person){
  var gedxPerson = GedcomX.Person()
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
var Relations = function(data){
  this.data = data;
};

Relations.prototype.getPerson = function(personId){
  return utils.find(this.data.Persons, function(person){
    return person.Id === personId;
  });
};

Relations.prototype.getFamilies = function(personId){
  return this.data.Familys.filter(function(family){
    return family.FatherId === personId || family.MotherId === personId;
  });
};