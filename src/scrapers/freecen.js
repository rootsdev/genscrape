var debug = require('debug')('genscrape:scrapers:freecen'),
    utils = require('../utils'),
    GedcomX = require('gedcomx-js');

var urls = [
  /^https?:\/\/www\.freecen\.org\.uk\/search_records\/[0-9a-f]{24}(\/|\?|#|$)/
];

module.exports = function(register){
  register(urls, run);
};

function run(emitter){

  debug('run');

  var recordId = getRecordId(document.location.href),
      location = getTableRows(findTable('location'))[0],
      people = getTableRows(findTable('each person'), true);

  debug('people: ' + people.length);

  if(!recordId || !location || !people.length){
    return emitter.emit('noData');
  }

  var gedx = GedcomX(),
      censusPlace = getCensusPlace(location),
      head,
      principal;

  // Create all of the persons
  var created = people.map(function(row){
    row.person = createPerson(row, location['Census'], censusPlace);
    return row;
  });
  principal = (created.filter(function(row){
    return row.isPrincipal && row.person;
  })[0] || created.filter(function(row){
    return row.person;
  })[0] || {}).person;

  if(!principal){
    return emitter.emit('noData');
  }

  // The principal needs its id before relationships are created
  principal.setPrincipal(true);
  principal.setId(recordId);
  principal.setIdentifiers({
    'genscrape': 'genscrape://freecen/' + recordId
  });

  created.forEach(function(row){
    var person = row.person;
    if(!person){
      return;
    }
    gedx.addPerson(person);
    if(!head && /^head$/i.test(row['Relationship'])){
      head = person;
    }
  });

  // Relationships to the head of household
  if(head){
    people.forEach(function(row){
      if(row.person && row.person !== head){
        addRelationship(gedx, head, row.person, row['Relationship']);
      }
    });
  }

  // Agent
  gedx.addAgent(GedcomX.Agent()
    .setId('agent')
    .addName({
      lang: 'en',
      value: 'FreeCEN'
    })
    .setHomepage({
      resource: 'https://www.freecen.org.uk'
    }));

  // SourceDescription
  var name = principal.getNames()[0].getNameForms()[0].getFullText(),
      title = location['Census'] + ' census, ' + name + ', ' + censusPlace;
  gedx.addSourceDescriptionToAll({
    about: document.location.href,
    titles: [
      {
        value: title
      }
    ],
    citations: [
      {
        value: 'FreeCEN, "' + title + '" (' + document.location.href
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
  var match = url.match(/search_records\/([0-9a-f]{24})/);
  return match ? match[1] : null;
}

function clean(text){
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Find the table by a keyword in its (accessible) caption
 */
function findTable(keyword){
  var tables = Array.from(document.querySelectorAll('table')),
      result;
  tables.forEach(function($table){
    var $caption = $table.querySelector('caption');
    if(!result && $caption && $caption.textContent.indexOf(keyword) !== -1){
      result = $table;
    }
  });
  return result;
}

/**
 * Convert the table into an array of objects keyed by the column headers. The
 * columns vary by census year. Rows have `isPrincipal` set to true when
 * flagged as the person who was found by the search.
 */
function getTableRows($table){
  if(!$table){
    return [];
  }
  var headers = Array.from($table.querySelectorAll('th')).map(function($th){
    return clean($th.textContent);
  }).filter(Boolean);

  return Array.from($table.querySelectorAll('tbody tr')).map(function($tr){
    var row = {},
        $cells = $tr.querySelectorAll('td');
    if($cells.length !== headers.length){
      return null;
    }
    headers.forEach(function(header, i){
      // Remove the screen reader text from the cell
      var $flag = $cells[i].querySelector('.accessibility');
      if($flag){
        row.isPrincipal = true;
        $flag.parentNode.removeChild($flag);
      }
      row[header] = clean($cells[i].textContent);
    });
    return row;
  }).filter(Boolean);
}

/**
 * The location of the household as a single string
 */
function getCensusPlace(location){
  var parts = [location['House Number'], location['House or Street Name']].filter(Boolean).join(' ');
  return [
    parts,
    location['Civil Parish'],
    location['District'],
    location['County'].replace(/\s*\([A-Z]+\)$/, '')
  ].filter(Boolean).filter(function(part, i, arr){
    return arr.indexOf(part) === i;
  }).join(', ');
}

function createPerson(row, year, censusPlace){
  var forenames = row['Forenames'],
      surname = row['Surname'];

  if(!forenames && !surname){
    return;
  }

  var person = GedcomX.Person().addNameFromParts({
    'http://gedcomx.org/Given': forenames,
    'http://gedcomx.org/Surname': surname
  });
  person.getNames()[0].getNameForms()[0].setFullText([forenames, surname].filter(Boolean).join(' '));

  if(row['Sex'] === 'M'){
    person.setGender({type: 'http://gedcomx.org/Male'});
  } else if(row['Sex'] === 'F'){
    person.setGender({type: 'http://gedcomx.org/Female'});
  }

  // Census
  person.addFact({
    type: 'http://gedcomx.org/Census',
    date: {original: year},
    place: {original: censusPlace}
  });

  // Birth (approximate year from the age)
  var birthPlace = [row['Birth Place'], row['Birth County']].filter(Boolean).join(', '),
      age = parseInt(row['Age'], 10),
      birthFact = GedcomX.Fact({type: 'http://gedcomx.org/Birth'});
  if(birthPlace){
    birthFact.setPlace({original: birthPlace});
  }
  if(!isNaN(age) && /^\d+$/.test(row['Age']) && parseInt(year, 10)){
    birthFact.setDate({original: 'about ' + (parseInt(year, 10) - age)});
  }
  if(birthFact.getDate() || birthFact.getPlace()){
    person.addFact(birthFact);
  }

  if(row['Occupation']){
    person.addFact({
      type: 'http://gedcomx.org/Occupation',
      value: row['Occupation']
    });
  }

  if(row['Marital Status']){
    person.addFact({
      type: 'http://gedcomx.org/MaritalStatus',
      value: row['Marital Status']
    });
  }

  return person;
}

/**
 * Add the relationship between a person and the head of household, when the
 * relationship is one that can be expressed.
 */
function addRelationship(gedx, head, person, relationship){
  relationship = (relationship || '').toLowerCase();
  if(/^(wife|wf|husband|hus|spouse)$/.test(relationship)){
    gedx.addRelationship({
      type: 'http://gedcomx.org/Couple',
      person1: head,
      person2: person
    });
  } else if(/^(son|dau|daur|daughter|child|chd)$/.test(relationship)){
    gedx.addRelationship({
      type: 'http://gedcomx.org/ParentChild',
      person1: head,
      person2: person
    });
  } else if(/^(father|fa|mother|mo)$/.test(relationship)){
    gedx.addRelationship({
      type: 'http://gedcomx.org/ParentChild',
      person1: person,
      person2: head
    });
  }
}
