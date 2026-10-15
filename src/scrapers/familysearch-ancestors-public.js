var debug = require('debug')('genscrape:scrapers:familysearch-ancestors-public'),
    utils = require('../utils'),
    GedcomX = require('gedcomx-js');

var urls = [
  utils.urlPatternToRegex("https://ancestors.familysearch.org/*/*-*/*")
];

var monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

module.exports = function(register){
  register(urls, run);
};

function run(emitter){

  debug('run');

  var data = getPersonData();

  if(!data){
    return emitter.emit('noData');
  }

  var gedx = new GedcomX(),
      primary = queryPerson(data, getIdFromUrl() || data.identifier);

  primary.setPrincipal(true);
  gedx.addPerson(primary);

  asArray(data.parent).forEach(function(parent){
    var person = queryPerson(parent);
    if(person){
      gedx.addPerson(person);
      gedx.addRelationship({
        type: 'http://gedcomx.org/ParentChild',
        person1: person,
        person2: primary
      });
    }
  });

  asArray(data.spouse).forEach(function(spouse){
    var person = queryPerson(spouse);
    if(person){
      gedx.addPerson(person);
      gedx.addRelationship({
        type: 'http://gedcomx.org/Couple',
        person1: primary,
        person2: person
      });
    }
  });

  asArray(data.children).forEach(function(child){
    var person = queryPerson(child);
    if(person){
      gedx.addPerson(person);
      gedx.addRelationship({
        type: 'http://gedcomx.org/ParentChild',
        person1: primary,
        person2: person
      });
    }
  });

  // Agent
  gedx.addAgent(GedcomX.Agent()
    .setId('agent')
    .addName({
      lang: 'en',
      value: 'FamilySearch Ancestors'
    })
    .setHomepage({
      resource: 'https://ancestors.familysearch.org'
    }));

  // SourceDescription
  var title = data.name + ' - FamilySearch Ancestors';
  gedx.addSourceDescriptionToAll({
    about: document.location.href,
    titles: [
      {
        value: title
      }
    ],
    citations: [
      {
        value: '"' + title + '," FamilySearch Ancestors (' + document.location.href
          + ' : accessed ' + utils.getDateString() + ')'
      }
    ],
    repository: {
      resource: '#agent'
    }
  });

  emitter.emit('data', gedx);
}

/**
 * Find the schema.org Person JSON-LD that describes the profile
 *
 * @return {Object}
 */
function getPersonData(){
  var scripts = document.querySelectorAll('script[type="application/ld+json"]');
  for(var i = 0; i < scripts.length; i++){
    try {
      var json = JSON.parse(scripts[i].textContent);
      if(json && json['@type'] === 'Person' && json.name){
        return json;
      }
    } catch(e) {
      debug('invalid json-ld');
    }
  }
}

function getIdFromUrl(){
  var match = document.location.pathname.match(/^\/[^\/]+\/([^\/]+)/);
  return match ? match[1] : null;
}

function asArray(value){
  return Array.isArray(value) ? value : [];
}

/**
 * @param {Object} data schema.org Person
 * @param {String} id Override for the person ID
 * @return {GedcomX.Person}
 */
function queryPerson(data, id){
  if(!data || !data.name){
    return null;
  }

  id = id || data.identifier;

  var person = GedcomX.Person();
  if(id){
    person.setId(id);
    person.setIdentifiers({
      'genscrape': 'genscrape://familysearch-ancestors-public/' + id
    });
  }

  person.addSimpleName(data.name);

  if(data.gender === 'Male'){
    person.setGender({type: 'http://gedcomx.org/Male'});
  } else if(data.gender === 'Female'){
    person.setGender({type: 'http://gedcomx.org/Female'});
  }

  addFact(person, 'http://gedcomx.org/Birth', data.birthDate, data.birthPlace);
  addFact(person, 'http://gedcomx.org/Death', data.deathDate, data.deathPlace);

  return person;
}

function addFact(person, type, date, place){
  date = formatDate(date);
  var placeText = place && (place.address || place.name);
  if(typeof placeText !== 'string'){
    placeText = null;
  }
  if(date || placeText){
    var fact = GedcomX.Fact({type: type});
    if(date){
      fact.setDate({original: date});
    }
    if(placeText){
      fact.setPlace({original: placeText});
    }
    person.addFact(fact);
  }
}

/**
 * Convert an ISO-ish date like +1850-06, +1925/ or /+1889
 * into a human readable string.
 *
 * @param {String} value
 * @return {String}
 */
function formatDate(value){
  if(typeof value !== 'string' || !value){
    return null;
  }
  var parts = value.split('/');
  if(parts.length === 2){
    if(parts[0] && !parts[1]){
      return 'After ' + formatSingle(parts[0]);
    } else if(!parts[0] && parts[1]){
      return 'Before ' + formatSingle(parts[1]);
    } else if(parts[0] && parts[1]){
      return 'From ' + formatSingle(parts[0]) + ' to ' + formatSingle(parts[1]);
    }
    return null;
  }
  return formatSingle(value);
}

function formatSingle(value){
  var m = value.replace(/^\+/, '').match(/^(-?\d+)(?:-(\d\d))?(?:-(\d\d))?/);
  if(!m){
    return value;
  }
  var year = m[1].replace(/^-/, '').replace(/^0+(?=\d)/, '');
  var text = year;
  if(m[2]){
    text = monthNames[parseInt(m[2], 10) - 1] + ' ' + year;
    if(m[3]){
      text = parseInt(m[3], 10) + ' ' + text;
    }
  }
  return m[1][0] === '-' ? text + ' BC' : text;
}
