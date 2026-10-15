var debug = require('debug')('genscrape:scrapers:archieven'),
    utils = require('../utils'),
    GedcomX = require('gedcomx-js');

// Archieven.nl record detail pages. These are search URLs that point to a
// single record with the `minr` (record number) parameter. www.openarch.nl is
// handled by the openarch scraper.
var urls = [
  /^https?:\/\/(?:www\.)?archieven\.nl\/(?:[a-z]{2}\/)?zoeken\?(?=[^#]*[?&]minr=\d+)(?=[^#]*[?&]micode=)/
];

var monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

var MALE = 'http://gedcomx.org/Male',
    FEMALE = 'http://gedcomx.org/Female';

module.exports = function(register){
  register(urls, run);
};

function run(emitter){
  debug('run');

  // The record details are loaded by AJAX after the page loads so we have to
  // wait for them to show up.
  var attempts = 0,
      interval = setInterval(function(){
        attempts++;
        if(hasRecord()){
          clearInterval(interval);
          process(emitter);
        } else if(attempts >= 40){
          clearInterval(interval);
          emitter.emit('noData');
        }
      }, 250);

  // Don't wait if the record is already there
  if(hasRecord()){
    clearInterval(interval);
    process(emitter);
  }
}

function hasRecord(){
  return !!document.querySelector('.mi_record .mi_detailstable .mi_list_item');
}

function process(emitter){

  var $record = document.querySelector('.mi_record'),
      rows = readRows($record),
      id = getRecordId(),
      gedx = new GedcomX(),
      principalRow, person;

  // Determine who the record is about
  ['kind', 'overledene', 'bruidegom'].forEach(function(label){
    if(!principalRow && rows[label]){
      principalRow = label;
    }
  });

  if(!principalRow){
    return emitter.emit('noData');
  }

  person = createPerson(rows[principalRow], principalRow === 'bruidegom' ? MALE : undefined);
  if(!person){
    return emitter.emit('noData');
  }
  person.setPrincipal(true);
  person.setId(id);
  person.setIdentifiers({
    'genscrape': 'genscrape://archieven/' + getInstitution() + '/' + id
  });
  gedx.addPerson(person);

  var gender = rows[principalRow].sub['Geslacht'];
  if(gender === 'Man'){
    person.setGender({type: MALE});
  } else if(gender === 'Vrouw'){
    person.setGender({type: FEMALE});
  }

  switch(principalRow){

    // Birth record
    case 'kind':
      addFact(person, 'http://gedcomx.org/Birth', rows['geboortedatum'], rows['geboorteplaats']);
      addParents(gedx, person, rows['vader'], rows['moeder']);
      break;

    // Death record
    case 'overledene':
      addFact(person, 'http://gedcomx.org/Birth', null, rows['overledene'].sub['Geboorteplaats'] ? {value: rows['overledene'].sub['Geboorteplaats']} : null);
      addFact(person, 'http://gedcomx.org/Death', rows['overlijdensdatum'], rows['overlijdensplaats']);
      addParents(gedx, person, rows['vader'], rows['moeder']);
      break;

    // Marriage record
    case 'bruidegom':
      addFact(person, 'http://gedcomx.org/Birth', null, rows['bruidegom'].sub['Geboorteplaats'] ? {value: rows['bruidegom'].sub['Geboorteplaats']} : null);
      addOccupation(person, rows['bruidegom']);
      addParents(gedx, person, rows['vader bruidegom'], rows['moeder bruidegom']);

      var bride = createPerson(rows['bruid'], FEMALE);
      if(bride){
        addFact(bride, 'http://gedcomx.org/Birth', null, rows['bruid'].sub['Geboorteplaats'] ? {value: rows['bruid'].sub['Geboorteplaats']} : null);
        addOccupation(bride, rows['bruid']);
        gedx.addPerson(bride);
        addParents(gedx, bride, rows['vader bruid'], rows['moeder bruid']);

        var couple = GedcomX.Relationship({
          type: 'http://gedcomx.org/Couple',
          person1: person,
          person2: bride
        });
        var marriage = createFact('http://gedcomx.org/Marriage', rows['huwelijksdatum'], rows['huwelijksplaats']);
        if(marriage){
          couple.addFact(marriage);
        }
        gedx.addRelationship(couple);
      }
      break;
  }

  // Agent
  gedx.addAgent(GedcomX.Agent()
    .setId('agent')
    .addName({
      lang: 'nl',
      value: 'Archieven.nl'
    })
    .setHomepage({
      resource: 'https://www.archieven.nl'
    }));

  // SourceDescription
  var title = text($record.querySelector('.mi_titlepart')) || document.title,
      series = text($record.querySelector('.mi_comlinks .mi_unittitle')),
      org = /Beherende organisatie:\s*([^\n]*?)\s*(?:laatste wijziging|$)/.exec(text($record.querySelector('.mi_record_det')) || '');
  gedx.addSourceDescriptionToAll({
    about: document.location.href,
    titles: [
      {
        value: title
      }
    ],
    citations: [
      {
        value: title + (series ? ', ' + series : '') + (org ? ', ' + org[1] : '')
          + ', Archieven.nl (' + document.location.href + ' : accessed ' + utils.getDateString() + ').'
      }
    ],
    repository: {
      resource: '#agent'
    }
  });

  emitter.emit('data', gedx);
}

/**
 * Read the top-level rows of the record.
 *
 * @param {Element} $record
 * @returns {Object} Map of lower-cased label => {value: String, sub: {label: value}}
 */
function readRows($record){
  var rows = {};
  Array.from($record.querySelectorAll('.mi_detailstable > .mi_list_item')).forEach(function(item){
    var labelEl = item.querySelector('.mi_label'),
        valueEl = item.querySelector('.mi_flexvalue');
    if(!labelEl || !valueEl){
      return;
    }
    var label = text(labelEl).replace(/:$/, '').toLowerCase(),
        sub = {};
    Array.from(item.querySelectorAll('.mi_det_items .mi_details')).forEach(function(detail){
      var subLabel = detail.querySelector('.mi_label'),
          subValue = detail.querySelector('.mi_value');
      if(subLabel && subValue){
        sub[text(subLabel).replace(/:$/, '')] = text(subValue);
      }
    });
    if(rows[label] === undefined){
      rows[label] = {
        value: textWithoutLinks(valueEl),
        sub: sub
      };
    }
  });
  return rows;
}

/**
 * Create a person from a row with a name and name parts
 */
function createPerson(row, gender){
  if(!row || !row.value){
    return;
  }
  var person = GedcomX.Person(),
      given = row.sub['Voornaam'],
      surname = [row.sub['Tussenvoegsel'], row.sub['Achternaam']].filter(Boolean).join(' ');
  if(given || surname){
    person.addNameFromParts({
      'http://gedcomx.org/Given': given,
      'http://gedcomx.org/Surname': surname
    });
    person.getNames()[0].getNameForms()[0].setFullText(row.value);
  } else {
    person.addSimpleName(row.value);
  }
  if(gender){
    person.setGender({type: gender});
  }
  return person;
}

function addParents(gedx, child, fatherRow, motherRow){
  var father = createPerson(fatherRow, MALE),
      mother = createPerson(motherRow, FEMALE);
  if(father){
    addOccupation(father, fatherRow);
    gedx.addPerson(father);
    gedx.addRelationship({type: 'http://gedcomx.org/ParentChild', person1: father, person2: child});
  }
  if(mother){
    addOccupation(mother, motherRow);
    gedx.addPerson(mother);
    gedx.addRelationship({type: 'http://gedcomx.org/ParentChild', person1: mother, person2: child});
  }
  if(father && mother){
    gedx.addRelationship({type: 'http://gedcomx.org/Couple', person1: father, person2: mother});
  }
}

function addOccupation(person, row){
  if(row && row.sub['Beroep']){
    person.addFact({
      type: 'http://gedcomx.org/Occupation',
      value: row.sub['Beroep']
    });
  }
}

function createFact(type, dateRow, placeRow){
  var date = dateRow ? formatDate(dateRow.value) : null,
      place = placeRow ? placeRow.value : null;
  if(!date && !place){
    return;
  }
  var fact = GedcomX.Fact({type: type});
  if(date){
    fact.setDate({original: date});
  }
  if(place){
    fact.setPlace({original: place});
  }
  return fact;
}

function addFact(person, type, dateRow, placeRow){
  var fact = createFact(type, dateRow, placeRow);
  if(fact){
    person.addFact(fact);
  }
}

/**
 * Convert 26-01-1882 into 26 January 1882
 */
function formatDate(value){
  var match = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(value || '');
  if(match && monthNames[parseInt(match[2], 10) - 1]){
    return parseInt(match[1], 10) + ' ' + monthNames[parseInt(match[2], 10) - 1] + ' ' + match[3];
  }
  return value || undefined;
}

function text(el){
  return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
}

/**
 * Text of a value cell without the hidden "find" link
 */
function textWithoutLinks(el){
  var clone = el.cloneNode(true);
  Array.from(clone.querySelectorAll('a, svg')).forEach(function(node){
    node.parentNode.removeChild(node);
  });
  return text(clone);
}

function getRecordId(){
  var match = /[?&]minr=(\d+)/.exec(document.location.href);
  return match ? match[1] : '';
}

function getInstitution(){
  var match = /[?&]miadt=(\d+)/.exec(document.location.href);
  return match ? match[1] : '0';
}
