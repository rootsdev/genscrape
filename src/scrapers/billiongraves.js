var debug = require('debug')('genscrape:scrapers:billiongraves'),
    utils = require('../utils'),
    GedcomX = require('gedcomx-js');

var urls = [
  utils.urlPatternToRegex("http://billiongraves.com/grave/*")
];

module.exports = function(register){
  register(urls, run);
};

function run(emitter){
  debug('run');
  
  var json;
  
  // Extract base64 encoded JSON
  try {
    json = JSON.parse(window.atob(document.getElementById('props').textContent));
  } catch(error) {
    debug('error parsing base64 encoded json');
    debug(error);
    emitter.emit('error', error);
    return;
  }
  
  var record = json.record,
      gedx = new GedcomX(), 
      primaryPerson = GedcomX.Person();
  
  gedx.addPerson(primaryPerson);
      
  // The given_names and family_names properties are poorly formatted so we don't use them
  primaryPerson.addSimpleName(record.fullname);
  
  if(dateAvailable(record.birth_date)){
    primaryPerson.addFact({
      type: 'http://gedcomx.org/Birth',
      date: {
        original: record.birth_date
      }
    });
  }
  
  if(dateAvailable(record.marriage_date)){
    primaryPerson.addFact({
      type: 'http://gedcomx.org/Marriage',
      date: {
        original: record.marriage_date
      }
    });
  }
  
  if(dateAvailable(record.death_date)){
    var formalDeathDate;
    if(record.death_year){
      formalDeathDate = '+' + record.death_year;
      if(record.death_month){
        formalDeathDate += '-' + record.death_month;
        if(record.death_day){
          formalDeathDate += '-' + record.death_day;
        }
      }
    }
    primaryPerson.addFact({
      type: 'http://gedcomx.org/Death',
      date: {
        original: record.death_date,
        formal: formalDeathDate
      }
    });
  }
  
  // Relationships
  // We don't actually know how they're related, we just have names and dates
  record.relationships.forEach(function(relation){
    var person = GedcomX.Person();
    person.addSimpleName(relation.fullname);
    if(dateAvailable(relation.birth_date)){
      person.addFact({
        type: 'http://gedcomx.org/Birth',
        date: {
          original: relation.birth_date
        }
      });
    }
    if(dateAvailable(relation.death_date)){
      person.addFact({
        type: 'http://gedcomx.org/Death',
        date: {
          original: relation.death_date
        }
      });
    }
    gedx.addPerson(person);
  });
  
  // Source Description
  
  debug('data', gedx);
  emitter.emit('data', gedx);
}

/**
 * Returns true if the given string is a date string
 * 
 * @param {String} date
 * @returns {Boolean}
 */
function dateAvailable(date){
  return date !== 'Not Available';
}