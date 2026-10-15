var debug = require('debug')('genscrape:scrapers:irishgenealogy'),
    utils = require('../utils'),
    GedcomX = require('gedcomx-js');

var urls = [
  /^https?:\/\/(www\.)?irishgenealogy\.ie\/view\/?\?(.*&)?record_id=[^&#]+/
];

var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];

module.exports = function(register){
  register(urls, run);
};

var recordId;

function run(emitter){

  debug('run');

  recordId = getRecordId(document.location.href);

  var $title = document.querySelector('h3'),
      title = $title ? clean($title.textContent) : '',
      typeMatch = title.match(/^(Birth|Death|Marriage|Baptism|Burial) record for/i);

  if(!recordId || !typeMatch){
    return emitter.emit('noData');
  }

  var type = typeMatch[1].charAt(0).toUpperCase() + typeMatch[1].substring(1).toLowerCase(),
      rows = getRows(),
      location = getLocation(),
      eventDate = getTitleDate(title),
      gedx = GedcomX(),
      principal;

  debug('type: ' + type);

  switch(type){
    case 'Birth':
      principal = processCivilBirth(gedx, rows, location);
      break;
    case 'Death':
      principal = processCivilDeath(gedx, rows, location);
      break;
    case 'Baptism':
      principal = processBaptism(gedx, rows, location, eventDate);
      break;
    case 'Burial':
      principal = processBurial(gedx, rows, location, eventDate);
      break;
    case 'Marriage':
      if(rows['Party 1 Name']){
        principal = processCivilMarriage(gedx, rows, location);
      } else {
        principal = processChurchMarriage(gedx, rows, location, eventDate);
      }
      break;
  }

  if(!principal){
    return emitter.emit('noData');
  }

  // Agent
  gedx.addAgent(GedcomX.Agent()
    .setId('agent')
    .addName({
      lang: 'en',
      value: 'IrishGenealogy.ie'
    })
    .setHomepage({
      resource: 'https://www.irishgenealogy.ie'
    }));

  // SourceDescription
  var sourceTitle = title.replace(/\s+/g, ' ');
  gedx.addSourceDescriptionToAll({
    about: document.location.href,
    titles: [
      {
        value: sourceTitle
      }
    ],
    citations: [
      {
        value: 'IrishGenealogy.ie, "' + sourceTitle + '" (' + document.location.href
          + ' : accessed ' + utils.getDateString() + ')'
      }
    ],
    repository: {
      resource: '#agent'
    }
  });

  emitter.emit('data', gedx);
}

function getRecordId(url){
  var match = url.match(/[?&]record_id=([^&#]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function clean(text){
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Values which mean "not recorded"
 */
function value(text){
  text = clean(text || '');
  if(/^(N\/?R|N\/?A|Null|NR NR|N\/R N\/R)$/i.test(text)){
    return '';
  }
  return text;
}

/**
 * Read the details table. Rows with a label and one value map to a string.
 * Rows of a marriage (label, husband, wife) map to an array of 2 strings.
 */
function getRows(){
  var rows = {};
  Array.from(document.querySelectorAll('#result-details tr')).forEach(function($tr){
    var $cells = $tr.querySelectorAll('td'),
        label;
    if($cells.length === 2){
      label = clean($cells[0].textContent).replace(/:$/, '');
      rows[label] = value($cells[1].textContent);
    } else if($cells.length === 3){
      label = clean($cells[0].textContent).replace(/:$/, '');
      if(label){
        rows[label] = [value($cells[1].textContent), value($cells[2].textContent)];
      }
    }
  });
  return rows;
}

/**
 * Church records: "Area - DUBLIN (RC), Parish/Church/Congregation - ST. JAMES"
 * Civil records: "/ New Ross"
 */
function getLocation(){
  var $span = document.querySelector('span.mb-0'),
      text = $span ? clean($span.textContent) : '',
      match = text.match(/^Area - (.*?), Parish\/Church\/Congregation - (.*)$/);
  if(match){
    return match[2] + ', ' + match[1];
  }
  return text.replace(/^\/\s*/, '');
}

/**
 * Get the date from titles such as "... on 10 February 1851" or "... in 1872"
 */
function getTitleDate(title){
  var match = title.match(/\s(?:on|in)\s+(\d.*)$/);
  return match ? clean(match[1]) : '';
}

/**
 * Civil marriage dates are dd/mm/yyyy
 */
function formatCivilDate(date){
  var match = (date || '').match(/^(\d\d)\/(\d\d)\/(\d{4})$/);
  if(match && months[parseInt(match[2], 10) - 1]){
    return parseInt(match[1], 10) + ' ' + months[parseInt(match[2], 10) - 1] + ' ' + match[3];
  }
  return date;
}

function createPerson(name, sex){
  if(!name){
    return;
  }
  var person = GedcomX.Person().addSimpleName(name);
  if(sex === 'M'){
    person.setGender({type: 'http://gedcomx.org/Male'});
  } else if(sex === 'F'){
    person.setGender({type: 'http://gedcomx.org/Female'});
  }
  return person;
}

function markPrincipal(person){
  person.setPrincipal(true);
  person.setId(recordId);
  person.setIdentifiers({
    'genscrape': 'genscrape://irishgenealogy/' + recordId
  });
}

function addFact(holder, type, date, place){
  if(date || place){
    var fact = GedcomX.Fact({type: type});
    if(date){
      fact.setDate({original: date});
    }
    if(place){
      fact.setPlace({original: place});
    }
    holder.addFact(fact);
  }
}

function addResidence(person, address){
  if(address){
    person.addFact({
      type: 'http://gedcomx.org/Residence',
      place: {original: address}
    });
  }
}

function addOccupation(person, occupation){
  if(occupation){
    person.addFact({
      type: 'http://gedcomx.org/Occupation',
      value: occupation
    });
  }
}

function addParents(gedx, child, fatherName, motherName){
  var father = createPerson(fatherName, 'M'),
      mother = createPerson(motherName, 'F');
  [father, mother].forEach(function(parent){
    if(parent){
      gedx.addPerson(parent);
      gedx.addRelationship({
        type: 'http://gedcomx.org/ParentChild',
        person1: parent,
        person2: child
      });
    }
  });
  if(father && mother){
    gedx.addRelationship({
      type: 'http://gedcomx.org/Couple',
      person1: father,
      person2: mother
    });
  }
}

/**
 * Add everyone in the record with a label like "Witness 1" or "Sponsor 2"
 */
function addOthers(gedx, rows, labelPattern){
  Object.keys(rows).filter(function(label){
    return labelPattern.test(label) && typeof rows[label] === 'string' && rows[label];
  }).forEach(function(label){
    gedx.addPerson(createPerson(rows[label]));
  });
}

// An age such as "40" or "10 Yrs"
function birthYearFromAge(year, age){
  var y = parseInt(year, 10),
      match = (age || '').match(/^(\d+)(\s*(yrs?|years?))?$/i);
  if(y && match){
    return 'about ' + (y - parseInt(match[1], 10));
  }
}

function processCivilBirth(gedx, rows, location){
  var person = createPerson(rows['Name']);
  if(!person){
    return;
  }
  addFact(person, 'http://gedcomx.org/Birth', rows['Year of Birth'], location);
  markPrincipal(person);
  gedx.addPerson(person);

  // The index includes the mother's maiden name
  var maidenName = rows['Mother\'s Birth Surname'];
  if(maidenName){
    var mother = GedcomX.Person().addNameFromParts({
      'http://gedcomx.org/Surname': maidenName
    });
    mother.setGender({type: 'http://gedcomx.org/Female'});
    gedx.addPerson(mother);
    gedx.addRelationship({
      type: 'http://gedcomx.org/ParentChild',
      person1: mother,
      person2: person
    });
  }
  return person;
}

function processCivilDeath(gedx, rows, location){
  var person = createPerson(rows['Name']);
  if(!person){
    return;
  }
  var deathDate = rows['Date of Death'],
      age = rows['Deceased Age at Death'],
      birthDate = birthYearFromAge(deathDate, age);
  if(birthDate){
    addFact(person, 'http://gedcomx.org/Birth', birthDate);
  }
  addFact(person, 'http://gedcomx.org/Death', deathDate, location);
  markPrincipal(person);
  gedx.addPerson(person);
  return person;
}

function processCivilMarriage(gedx, rows, location){
  var party1 = createPerson(rows['Party 1 Name']),
      party2 = createPerson(rows['Party 2 Name']);
  if(!party1){
    return;
  }
  markPrincipal(party1);
  gedx.addPerson(party1);
  if(party2){
    gedx.addPerson(party2);
    var couple = GedcomX.Relationship({
      type: 'http://gedcomx.org/Couple',
      person1: party1,
      person2: party2
    });
    addFact(couple, 'http://gedcomx.org/Marriage', formatCivilDate(rows['Date of Event']), location);
    gedx.addRelationship(couple);
  }
  return party1;
}

function processBaptism(gedx, rows, location, date){
  var person = createPerson(rows['Name']);
  if(!person){
    return;
  }
  addFact(person, 'http://gedcomx.org/Baptism', date, location);
  addResidence(person, rows['Address']);
  markPrincipal(person);
  gedx.addPerson(person);
  addParents(gedx, person, rows['Father'], rows['Mother']);
  addOthers(gedx, rows, /^Sponsor \d+$/);
  return person;
}

function processBurial(gedx, rows, location, date){
  var person = createPerson(rows['Name']);
  if(!person){
    return;
  }
  var deathDate = rows['Date of Death'],
      birthDate = birthYearFromAge((deathDate || date).match(/\d{4}/) ? (deathDate || date).match(/\d{4}/)[0] : '', rows['Age']);
  if(birthDate){
    addFact(person, 'http://gedcomx.org/Birth', birthDate);
  }
  addFact(person, 'http://gedcomx.org/Death', deathDate);
  addFact(person, 'http://gedcomx.org/Burial', date, location);
  addResidence(person, rows['Address']);
  addOccupation(person, rows['Occupation']);
  markPrincipal(person);
  gedx.addPerson(person);
  return person;
}

function processChurchMarriage(gedx, rows, location, date){
  var names = rows['Name'] || [],
      groom = createPerson(names[0], 'M'),
      bride = createPerson(names[1], 'F');

  if(!groom && !bride){
    return;
  }

  markPrincipal(groom || bride);

  [groom, bride].forEach(function(person, i){
    if(person){
      addResidence(person, (rows['Address'] || [])[i]);
      addOccupation(person, (rows['Occupation'] || [])[i]);
      gedx.addPerson(person);
      addParents(gedx, person, (rows['Father'] || [])[i], (rows['Mother'] || [])[i]);
    }
  });

  if(groom && bride){
    var couple = GedcomX.Relationship({
      type: 'http://gedcomx.org/Couple',
      person1: groom,
      person2: bride
    });
    addFact(couple, 'http://gedcomx.org/Marriage', date, location);
    gedx.addRelationship(couple);
  }

  addOthers(gedx, rows, /^Witness \d+$/);

  return groom || bride;
}
