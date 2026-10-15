var debug = require('debug')('genscrape:scrapers:digitalarkivet'),
    utils = require('../utils'),
    GedcomX = require('gedcomx-js');

// Matches census person pages (/en/census/person/pf...) and church book / other
// transcribed person records (/en/view/<n>/p<x>...). The language prefix is optional.
var urls = [
  /^https?:\/\/(?:www\.)?digitalarkivet\.no\/(?:[a-z]{2}\/)?(?:census\/person\/pf\d+|view\/\d+\/p[a-z]\d+)/
];

module.exports = function(register){
  register(urls, run);
};

function run(emitter){

  debug('run');

  var values = getLabeledValues(document.querySelector('.left-view-column') || document),
      recordId = getRecordId(),
      isCensus = /\/census\/person\//.test(document.location.href),
      recordPrefix = recordId.substr(0, 2),
      gedx = new GedcomX(),
      person = GedcomX.Person({
        principal: true,
        id: recordId,
        identifiers: {
          'genscrape': getRecordIdentifier(recordId)
        }
      }),
      sourceTitle;

  gedx.addPerson(person);

  // Gender. m = male, k = kvinne (female)
  var gender = clean(values['Gender']);
  if(gender === 'm'){
    person.setGender({type: 'http://gedcomx.org/Male'});
  } else if(gender === 'k'){
    person.setGender({type: 'http://gedcomx.org/Female'});
  }

  if(isCensus){
    sourceTitle = processCensus(gedx, person, values);
  } else {
    sourceTitle = processChurchRecord(gedx, person, values, recordPrefix);
  }

  if(!person.getNames().length){
    emitter.emit('noData');
    return;
  }

  // Agent
  gedx.addAgent(GedcomX.Agent()
    .setId('agent')
    .addName({
      lang: 'en',
      value: 'Digitalarkivet (The Digital Archive)'
    })
    .setHomepage({
      resource: 'https://www.digitalarkivet.no'
    }));

  // SourceDescription
  var name = person.getNames()[0].getNameForms()[0].getFullText() || '',
      title = name + (sourceTitle ? ' - ' + sourceTitle : '');
  gedx.addSourceDescriptionToAll({
    about: document.location.href,
    titles: [
      {
        value: title
      }
    ],
    citations: [
      {
        value: '"' + (sourceTitle || 'Digitalarkivet') + '," database, Digitalarkivet, The National Archives of Norway ('
          + document.location.href + ' : accessed ' + utils.getDateString() + '), entry for ' + name + '.'
      }
    ],
    repository: {
      resource: '#agent'
    }
  });

  emitter.emit('data', gedx);
}

/**
 * Process a census person page.
 *
 * @param {GedcomX} gedx
 * @param {Person} person
 * @param {Object} values
 * @returns {String} Title of the source
 */
function processCensus(gedx, person, values){

  var h1 = document.querySelector('h1'),
      fullName = h1 ? h1.textContent.replace(/^\s*Person:\s*/, '').replace(/^\s*\d+\s+/, '').replace(/\s+/g, ' ').trim() : '',
      sourceLink = document.querySelector('.da-breadcrumb a[href*="/source/"]'),
      sourceTitle = sourceLink ? sourceLink.textContent.trim() : '',
      yearMatch = /(\d{4})/.exec(sourceTitle),
      municipalityMatch = /census for (.+)$/i.exec(sourceTitle),
      residenceLink = document.querySelector('.da-breadcrumb a[href*="residence/"]'),
      residence = residenceLink ? residenceLink.textContent.replace(/^\s*\d+\w*\s+/, '').trim() : '',
      place = [residence, municipalityMatch ? municipalityMatch[1].trim() : '', 'Norway'].filter(Boolean).join(', ');

  person.addSimpleName(fullName);

  // Birth
  addFact(person, 'http://gedcomx.org/Birth', clean(values['Date of birth']), clean(values['Place of birth']));

  // Census and residence
  if(yearMatch){
    addFact(person, 'http://gedcomx.org/Census', yearMatch[1], place);
    addFact(person, 'http://gedcomx.org/Residence', yearMatch[1], place);
  }

  // Occupation
  addFact(person, 'http://gedcomx.org/Occupation', null, null, clean(values['Occupation']));

  // Marital status
  addFact(person, 'http://gedcomx.org/MaritalStatus', null, null, clean(values['Marital status']));

  // Household members. Family positions: hf = father of the household,
  // hm = mother of the household, s = son, d = daughter
  var familyPosition = clean(values['Family position']),
      members = [], parents = [], spouse, children = [];
  Array.from(document.querySelectorAll('#accordion-persons .data-item')).forEach(function(item){
    var link = item.querySelector('h4 a');
    if(!link){
      return;
    }
    var id = getRecordIdFromUrl(link.href);
    if(id === person.getId()){
      return;
    }
    var itemValues = getLabeledValues(item);

    // Only the person's own household
    if(clean(itemValues['H.no.']) !== clean(values['Household no.'])){
      return;
    }

    var position = clean(itemValues['Family position']),
        relative = GedcomX.Person({
          id: id,
          identifiers: {
            'genscrape': getRecordIdentifier(id)
          }
        }).addSimpleName(link.textContent.replace(/\s+/g, ' ').replace(/^\s*\d+\s+/, '').trim()),
        born = clean(itemValues['Age/born']);
    if(/^\d{4}(-\d\d-\d\d)?$/.test(born || '')){
      addFact(relative, 'http://gedcomx.org/Birth', born, clean(itemValues['Place of birth']));
    }
    if(position === 'hf' || position === 's'){
      relative.setGender({type: 'http://gedcomx.org/Male'});
    } else if(position === 'hm' || position === 'd'){
      relative.setGender({type: 'http://gedcomx.org/Female'});
    }
    members.push({position: position, person: relative});
  });

  // Households with more than one couple (e.g. boarding houses) are ambiguous
  // so relationships are only inferred when there is at most one hf and one hm.
  var heads = members.filter(function(m){ return m.position === 'hf'; }).length + (familyPosition === 'hf' ? 1 : 0),
      mothers = members.filter(function(m){ return m.position === 'hm'; }).length + (familyPosition === 'hm' ? 1 : 0);
  if(heads <= 1 && mothers <= 1){
    members.forEach(function(member){
      var position = member.position;
      if(familyPosition === 's' || familyPosition === 'd'){
        if(position === 'hf' || position === 'hm'){
          parents.push(member.person);
        }
      } else if((familyPosition === 'hf' && position === 'hm') || (familyPosition === 'hm' && position === 'hf')){
        spouse = member.person;
      } else if((familyPosition === 'hf' || familyPosition === 'hm') && (position === 's' || position === 'd')){
        children.push(member.person);
      }
    });
  }

  parents.forEach(function(parent){
    gedx.addPerson(parent);
    gedx.addRelationship({
      type: 'http://gedcomx.org/ParentChild',
      person1: parent,
      person2: person
    });
  });
  if(parents.length === 2){
    gedx.addRelationship({
      type: 'http://gedcomx.org/Couple',
      person1: parents[0],
      person2: parents[1]
    });
  }
  if(spouse){
    gedx.addPerson(spouse);
    gedx.addRelationship({
      type: 'http://gedcomx.org/Couple',
      person1: person,
      person2: spouse
    });
  }
  children.forEach(function(child){
    gedx.addPerson(child);
    gedx.addRelationship({
      type: 'http://gedcomx.org/ParentChild',
      person1: person,
      person2: child
    });
    if(spouse){
      gedx.addRelationship({
        type: 'http://gedcomx.org/ParentChild',
        person1: spouse,
        person2: child
      });
    }
  });

  return sourceTitle;
}

/**
 * Process a church book (or other transcribed record) page.
 *
 * @param {GedcomX} gedx
 * @param {Person} person
 * @param {Object} values
 * @param {String} prefix Two letter record type prefix of the permanent ID
 * @returns {String} Title of the source
 */
function processChurchRecord(gedx, person, values, prefix){

  var infobox = document.querySelector('.infobox'),
      sourceTitle = infobox ? utils.maybe(infobox.querySelector('p.ssp-semibold')).textContent : '',
      infoValues = infobox ? getLabeledValues(infobox) : {},
      eventLink = infobox ? infobox.querySelector('.parent p a') : null,
      eventDate = eventLink ? eventLink.textContent.trim() : '',
      role = clean(values['Role']),
      givenName = cleanName(values['Given name']),
      surname = cleanName(values['Last name']);

  sourceTitle = sourceTitle ? sourceTitle.replace(/\s+/g, ' ').trim() : '';

  // Name
  if(givenName || surname){
    person.addNameFromParts({
      'http://gedcomx.org/Given': givenName,
      'http://gedcomx.org/Surname': surname
    });
    person.getNames()[0].getNameForms()[0].setFullText([givenName, surname].filter(Boolean).join(' '));
  } else {
    var h1 = document.querySelector('h1');
    if(h1){
      person.addSimpleName(cleanName(h1.textContent.replace(/^\s*Person:\s*/, '')));
    }
  }

  // Place for the event: parish from the record, falling back to the geographic area
  var eventPlace = clean(values['Parish/Church']) || clean(infoValues['Parish/Church']) || firstGeographicArea(infobox);
  if(eventPlace){
    eventPlace = [eventPlace, clean(infoValues['County']), 'Norway'].filter(Boolean).join(', ');
  }

  // Birth
  addFact(person, 'http://gedcomx.org/Birth', combineDate(clean(values['Date of birth']), clean(values['Birth year'])), clean(values['Birth place']));

  // Residence
  addFact(person, 'http://gedcomx.org/Residence', null, clean(values['Residence']));

  switch(prefix){

    // Births and baptisms
    case 'pd':
      if(role === 'barn'){
        addFact(person, 'http://gedcomx.org/Baptism', eventDate || combineDate(clean(values['Baptism date']), clean(values['Year'])), eventPlace);
        processFamily(gedx, person, 'barn');
      } else if(role === 'far' || role === 'mor'){
        processFamily(gedx, person, role);
      }
      break;

    // Deaths and burials
    case 'pg':
      addFact(person, 'http://gedcomx.org/Death', combineDate(clean(values['Date of death']), clean(values['Year of death'])), null);
      addFact(person, 'http://gedcomx.org/Burial', eventDate || combineDate(clean(values['Burial date']), clean(values['Year'])), eventPlace);
      break;

    // Confirmations
    case 'pk':
      addFact(person, 'http://gedcomx.org/Confirmation', eventDate, eventPlace);
      break;

    // Marriages
    case 'pv':
      processMarriage(gedx, person, role, eventDate || combineDate(clean(values['Marriage date']), clean(values['Year'])), eventPlace);
      break;
  }

  return sourceTitle;
}

/**
 * Add the parents (when the person is the child) or the child and the other
 * parent (when the person is a parent) from the "Persons involved" list.
 *
 * @param {GedcomX} gedx
 * @param {Person} person
 * @param {String} role
 */
function processFamily(gedx, person, role){
  var father, mother, child;

  getInvolved().forEach(function(entry){
    if(entry.current){
      return;
    }
    if(entry.role === 'far' && !father){
      father = createInvolvedPerson(entry, 'http://gedcomx.org/Male');
    } else if(entry.role === 'mor' && !mother){
      mother = createInvolvedPerson(entry, 'http://gedcomx.org/Female');
    } else if(entry.role === 'barn' && !child){
      child = createInvolvedPerson(entry);
    }
  });

  if(role === 'barn'){
    if(father){
      gedx.addPerson(father);
      gedx.addRelationship({type: 'http://gedcomx.org/ParentChild', person1: father, person2: person});
    }
    if(mother){
      gedx.addPerson(mother);
      gedx.addRelationship({type: 'http://gedcomx.org/ParentChild', person1: mother, person2: person});
    }
    if(father && mother){
      gedx.addRelationship({type: 'http://gedcomx.org/Couple', person1: father, person2: mother});
    }
  } else {
    var other = role === 'far' ? mother : father;
    if(other){
      gedx.addPerson(other);
      gedx.addRelationship({type: 'http://gedcomx.org/Couple', person1: person, person2: other});
    }
    if(child){
      gedx.addPerson(child);
      gedx.addRelationship({type: 'http://gedcomx.org/ParentChild', person1: person, person2: child});
      if(other){
        gedx.addRelationship({type: 'http://gedcomx.org/ParentChild', person1: other, person2: child});
      }
    }
  }
}

/**
 * Add the spouse and the marriage fact
 *
 * @param {GedcomX} gedx
 * @param {Person} person
 * @param {String} role
 * @param {String} date
 * @param {String} place
 */
function processMarriage(gedx, person, role, date, place){
  var spouse;
  getInvolved().forEach(function(entry){
    if(!spouse && !entry.current && (entry.role === 'brudgom' || entry.role === 'brur')){
      spouse = createInvolvedPerson(entry, entry.role === 'brudgom' ? 'http://gedcomx.org/Male' : 'http://gedcomx.org/Female');
    }
  });
  if(role === 'brudgom'){
    person.setGender({type: 'http://gedcomx.org/Male'});
  } else if(role === 'brur'){
    person.setGender({type: 'http://gedcomx.org/Female'});
  }
  if(spouse){
    gedx.addPerson(spouse);
    var couple = GedcomX.Relationship({
      type: 'http://gedcomx.org/Couple',
      person1: person,
      person2: spouse
    });
    var fact = createFact('http://gedcomx.org/Marriage', date, place);
    if(fact){
      couple.addFact(fact);
    }
    gedx.addRelationship(couple);
  } else {
    addFact(person, 'http://gedcomx.org/Marriage', date, place);
  }
}

/**
 * Read the "Persons involved" list of a church record.
 *
 * @returns {Object[]} Array of {role, name, position, birthYear, birthPlace, residence, id, current}
 */
function getInvolved(){
  var entries = [];
  Array.from(document.querySelectorAll('.left-view-column .data-item')).forEach(function(item){
    var v = getLabeledValues(item),
        link = item.querySelector('h4 a');
    if(v['Role'] && v['Name']){
      entries.push({
        role: clean(v['Role']),
        name: cleanName(v['Name']),
        position: clean(v['Position']),
        birthYear: clean(v['Birth year']),
        birthPlace: clean(v['Birth place']),
        residence: clean(v['Residence']),
        id: link ? getRecordIdFromUrl(link.href) : null,
        current: (' ' + item.className + ' ').indexOf(' current ') !== -1
      });
    }
  });
  return entries;
}

function createInvolvedPerson(entry, gender){
  if(!entry.name){
    return;
  }
  var person = GedcomX.Person().addSimpleName(entry.name);
  if(entry.id){
    person.setId(entry.id);
    person.setIdentifiers({'genscrape': getRecordIdentifier(entry.id)});
  }
  if(gender){
    person.setGender({type: gender});
  }
  addFact(person, 'http://gedcomx.org/Birth', entry.birthYear, entry.birthPlace);
  addFact(person, 'http://gedcomx.org/Residence', null, entry.residence);
  return person;
}

/**
 * Get the first geographic area (the parish) of the source information box.
 *
 * @param {Element} infobox
 * @returns {String}
 */
function firstGeographicArea(infobox){
  if(!infobox){
    return '';
  }
  var rows = Array.from(infobox.querySelectorAll('.row'));
  for(var i = 0; i < rows.length; i++){
    if(/^Geographic area/.test(rows[i].textContent.trim())){
      var html = rows[i].children[1] ? rows[i].children[1].innerHTML : '',
          first = html.split(/<br\s*\/?>/i)[0].replace(/<[^>]+>/g, '').trim();
      return first.replace(/\s+parish$/i, '');
    }
  }
  return '';
}

/**
 * Combine a month-day (or full) date with a year.
 *
 * @param {String} date e.g. 11-29 or 1880-11-29
 * @param {String} year e.g. 1880
 * @returns {String}
 */
function combineDate(date, year){
  if(date && /^\d{4}/.test(date)){
    return date;
  }
  if(year && date){
    return year + '-' + date;
  }
  return year || undefined;
}

/**
 * Create a fact. Returns undefined if there is no useful data.
 */
function createFact(type, date, place, value){
  if(!date && !place && !value){
    return;
  }
  var fact = GedcomX.Fact({type: type});
  if(date){
    fact.setDate({original: date});
  }
  if(place){
    fact.setPlace({original: place});
  }
  if(value){
    fact.setValue(value);
  }
  return fact;
}

function addFact(person, type, date, place, value){
  var fact = createFact(type, date, place, value);
  if(fact){
    person.addFact(fact);
  }
}

/**
 * Build a map of label => value from all label/value pairs inside the element.
 * Labels are the text before the trailing colon. The first occurrence of
 * a label wins.
 *
 * @param {Element} root
 * @returns {Object}
 */
function getLabeledValues(root){
  var map = {};
  Array.from(root.querySelectorAll('.ssp-semibold')).forEach(function(valueEl){
    var labelEl = valueEl.previousElementSibling;
    if(labelEl && labelEl.className.indexOf('ssp-semibold') === -1){
      var label = labelEl.textContent.replace(/\s+/g, ' ').trim().replace(/:$/, '');
      if(label && map[label] === undefined){
        map[label] = valueEl.textContent.replace(/\s+/g, ' ').trim();
      }
    }
  });
  return map;
}

/**
 * Treat a dash as an empty value.
 */
function clean(value){
  if(value === undefined || value === null){
    return undefined;
  }
  value = value.replace(/\s+/g, ' ').trim();
  return value && value !== '-' ? value : undefined;
}

/**
 * Clean up a name from the transcription: remove transcription markers.
 */
function cleanName(value){
  value = clean(value);
  if(value){
    value = value.replace(/!+/g, '').replace(/^[?\s]+/, '').replace(/\s+/g, ' ').trim();
  }
  return value || undefined;
}

function getRecordId(){
  var id = getRecordIdFromUrl(document.location.href),
      permanent = document.getElementById('permanentId');
  if(permanent && permanent.textContent.trim()){
    id = permanent.textContent.trim();
  }
  return id;
}

function getRecordIdFromUrl(url){
  var match = /\/(p[a-z]\d+)(?:[\/?#]|$)/.exec(url || '');
  return match ? match[1] : '';
}

function getRecordIdentifier(id){
  return 'genscrape://digitalarkivet/' + id;
}
