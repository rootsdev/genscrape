var debug = require('debug')('genscrape:scrapers:freereg'),
    utils = require('../utils'),
    GedcomX = require('gedcomx-js');

var urls = [
  /^https?:\/\/www\.freereg\.org\.uk\/search_records\/[0-9a-f]{24}(\/|\?|#|$)/
];

module.exports = function(register){
  register(urls, run);
};

var recordId;

function run(emitter){

  debug('run');

  var fields = getFields(),
      type = getRecordType();

  recordId = getRecordId(document.location.href);

  debug('type: ' + type);

  if(!type || !recordId){
    return emitter.emit('noData');
  }

  var gedx = GedcomX(),
      principal;

  switch(type){
    case 'Baptism':
      principal = processBaptism(gedx, fields);
      break;
    case 'Marriage':
      principal = processMarriage(gedx, fields);
      break;
    case 'Burial':
      principal = processBurial(gedx, fields);
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
      value: 'FreeREG'
    })
    .setHomepage({
      resource: 'https://www.freereg.org.uk'
    }));

  // SourceDescription
  var title = type + ' of ' + getPrincipalName(principal)
    + (fields['County'] ? ', ' + fields['Place'] + ', ' + fields['County'] : '');
  gedx.addSourceDescriptionToAll({
    about: document.location.href,
    titles: [
      {
        value: title
      }
    ],
    citations: [
      {
        value: 'FreeREG, "' + title + '" (' + document.location.href
          + ' : accessed ' + utils.getDateString() + ')'
      }
    ],
    repository: {
      resource: '#agent'
    }
  });

  emitter.emit('data', gedx);
}

function getPrincipalName(person){
  var name = person.getNames()[0];
  return name ? name.getNameForms()[0].getFullText() : '';
}

/**
 * Get the record id from the url
 */
function getRecordId(url){
  var match = url.match(/search_records\/([0-9a-f]{24})/);
  return match ? match[1] : null;
}

/**
 * The table caption says "Baptism entry", "Marriage entry", "Burial entry"
 */
function getRecordType(){
  var $caption = document.querySelector('#results_detail_table caption');
  if($caption){
    var match = $caption.firstChild.textContent.match(/(Baptism|Marriage|Burial)/i);
    if(match){
      return match[1].charAt(0).toUpperCase() + match[1].substring(1).toLowerCase();
    }
  }
}

/**
 * Read all of the label/value rows into a map. Only rows which have a value are
 * present in the page.
 */
function getFields(){
  var fields = {};
  Array.from(document.querySelectorAll('#results_detail_table tbody tr')).forEach(function($row){
    var $cells = $row.querySelectorAll('td');
    if($cells.length === 2){
      var label = clean($cells[0].firstChild ? $cells[0].firstChild.textContent : $cells[0].textContent),
          value = clean($cells[1].textContent);
      if(label && value){
        fields[label] = value;
      }
    }
  });
  return fields;
}

function clean(text){
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Mark the person as the principal. This must happen before the person is
 * added to the document so that relationships reference the right id.
 */
function markPrincipal(person){
  person.setPrincipal(true);
  person.setId(recordId);
  person.setIdentifiers({
    'genscrape': 'genscrape://freereg/' + recordId
  });
}

/**
 * Create a person from name parts
 */
function createPerson(forename, surname, sex){
  if(!forename && !surname){
    return;
  }
  var person = GedcomX.Person().addNameFromParts({
    'http://gedcomx.org/Given': forename,
    'http://gedcomx.org/Surname': surname
  });
  var fullText = [forename, surname].filter(Boolean).join(' ');
  person.getNames()[0].getNameForms()[0].setFullText(fullText);
  if(sex === 'M'){
    person.setGender({type: 'http://gedcomx.org/Male'});
  } else if(sex === 'F'){
    person.setGender({type: 'http://gedcomx.org/Female'});
  }
  return person;
}

/**
 * The place of the event as a single string
 */
function getEventPlace(fields){
  return [fields['Church name'], fields['Place'], fields['County']].filter(Boolean).join(', ');
}

function addEventFact(person, type, date, place){
  if(date || place){
    var fact = GedcomX.Fact({type: type});
    if(date){
      fact.setDate({original: date});
    }
    if(place){
      fact.setPlace({original: place});
    }
    person.addFact(fact);
  }
}

function addAbode(person, abode){
  if(abode){
    person.addFact({
      type: 'http://gedcomx.org/Residence',
      place: {original: abode}
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

function addParentChild(gedx, parent, child){
  gedx.addPerson(parent);
  gedx.addRelationship({
    type: 'http://gedcomx.org/ParentChild',
    person1: parent,
    person2: child
  });
}

/**
 * Add parents to a child. `prefix` is prepended to the labels, e.g. "Groom "
 */
function addParents(gedx, child, fields, prefix){
  var father = createPerson(fields[prefix + 'Father forename'], fields[prefix + 'Father surname'], 'M'),
      mother = createPerson(fields[prefix + 'Mother forename'], fields[prefix + 'Mother surname'], 'F');
  if(father){
    addOccupation(father, fields[prefix + 'Father occupation']);
    addAbode(father, fields[prefix + 'Father abode']);
    addParentChild(gedx, father, child);
  }
  if(mother){
    addOccupation(mother, fields[prefix + 'Mother occupation']);
    addParentChild(gedx, mother, child);
  }
  if(father && mother){
    gedx.addRelationship({
      type: 'http://gedcomx.org/Couple',
      person1: father,
      person2: mother
    });
  }
}

function processBaptism(gedx, fields){
  // When the child's surname is not given it is the same as the father's
  var child = createPerson(fields['Person forename'], fields['Person surname'] || fields['Father surname'], fields['Person sex']);
  if(!child){
    return;
  }
  addEventFact(child, 'http://gedcomx.org/Baptism', fields['Baptism date'], getEventPlace(fields));
  addAbode(child, fields['Person abode']);
  markPrincipal(child);
  gedx.addPerson(child);
  addParents(gedx, child, fields, '');
  return child;
}

function processBurial(gedx, fields){
  var person = createPerson(fields['Burial person forename'], fields['Burial person surname'], fields['Person sex']);
  if(!person){
    return;
  }
  addEventFact(person, 'http://gedcomx.org/Burial', fields['Burial date'], getEventPlace(fields));
  addAbode(person, fields['Burial person abode']);
  markPrincipal(person);
  gedx.addPerson(person);

  // Relatives mentioned in the burial entry (e.g. husband of, wife of, child of)
  var relationship = (fields['Relationship'] || '').toLowerCase(),
      relatives = [
        createPerson(fields['Male relative forename'], fields['Relative surname'], 'M'),
        createPerson(fields['Female relative forename'], fields['Relative surname'], 'F')
      ];
  relatives.forEach(function(relative){
    if(!relative){
      return;
    }
    gedx.addPerson(relative);
    if(/^(son|daughter|child|infant)/.test(relationship)){
      gedx.addRelationship({
        type: 'http://gedcomx.org/ParentChild',
        person1: relative,
        person2: person
      });
    } else if(/^(wife|husband|widow|wid)/.test(relationship)){
      gedx.addRelationship({
        type: 'http://gedcomx.org/Couple',
        person1: person,
        person2: relative
      });
    }
  });
  return person;
}

function processMarriage(gedx, fields){
  var groom = createPerson(fields['Groom forename'], fields['Groom surname'], 'M'),
      bride = createPerson(fields['Bride forename'], fields['Bride surname'], 'F');

  if(!groom && !bride){
    return;
  }

  markPrincipal(groom || bride);

  var date = fields['Marriage date'],
      place = getEventPlace(fields);

  [[groom, 'Groom '], [bride, 'Bride ']].forEach(function(pair){
    var person = pair[0];
    if(person){
      addAbode(person, fields[pair[1] + 'abode']);
      addOccupation(person, fields[pair[1] + 'occupation']);
      gedx.addPerson(person);
      addParents(gedx, person, fields, pair[1]);
    }
  });

  if(groom && bride){
    var couple = GedcomX.Relationship({
      type: 'http://gedcomx.org/Couple',
      person1: groom,
      person2: bride
    });
    addEventFact(couple, 'http://gedcomx.org/Marriage', date, place);
    gedx.addRelationship(couple);
  }

  // Witnesses
  Object.keys(fields).filter(function(label){
    return /^Witness\d*$/.test(label);
  }).forEach(function(label){
    gedx.addPerson(GedcomX.Person().addSimpleName(fields[label]));
  });

  return groom || bride;
}
