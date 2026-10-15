var debug = require('debug')('genscrape:scrapers:gedbas'),
    utils = require('../utils'),
    GedcomX = require('gedcomx-js');

var urls = [
  /^https?:\/\/gedbas\.genealogy\.net\/person\/show\/\d+/
];

var FACT_TYPES = {
  'birth': 'http://gedcomx.org/Birth',
  'baptism': 'http://gedcomx.org/Baptism',
  'christening': 'http://gedcomx.org/Christening',
  'death': 'http://gedcomx.org/Death',
  'burial': 'http://gedcomx.org/Burial',
  'cremation': 'http://gedcomx.org/Cremation',
  'marriage': 'http://gedcomx.org/Marriage',
  'divorce': 'http://gedcomx.org/Divorce',
  'emigration': 'http://gedcomx.org/Emigration',
  'immigration': 'http://gedcomx.org/Immigration',
  'residence': 'http://gedcomx.org/Residence',
  'occupation': 'http://gedcomx.org/Occupation',
  'education': 'http://gedcomx.org/Education',
  'religion': 'http://gedcomx.org/Religion',
  'nationality': 'http://gedcomx.org/Nationality',
  'naturalization': 'http://gedcomx.org/Naturalization',
  'census': 'http://gedcomx.org/Census',
  'confirmation': 'http://gedcomx.org/Confirmation'
};

module.exports = function(register){
  register(urls, run);
};

function run(emitter){

  debug('run');

  var $h1 = document.querySelector('#bodyContent h1');

  if(!$h1 || !$h1.textContent.trim()){
    return emitter.emit('noData');
  }

  var gedx = new GedcomX(),
      persons = {},
      id = getId(document.location.pathname),
      name = $h1.textContent.replace(/\s+/g, ' ').trim(),
      primary = createPerson(id, name);

  primary.setPrincipal(true);
  persons[id] = primary;
  gedx.addPerson(primary);

  // Characteristics (occupation, education, ...) and events
  addFacts(primary, document.querySelectorAll('#characteristics tbody tr'), true);
  addFacts(primary, document.querySelectorAll('#events tbody tr'), false);

  // Parents
  var $parents = document.querySelectorAll('#parents a[href*="/person/show/"]');
  for(var i = 0; i < $parents.length; i++){
    var parent = getRelative($parents[i], persons, gedx);
    if(parent){
      addParentChild(gedx, parent, primary);
    }
  }
  if($parents.length === 2){
    var p1 = persons[getId($parents[0].getAttribute('href'))],
        p2 = persons[getId($parents[1].getAttribute('href'))];
    if(p1 && p2){
      gedx.addRelationship({
        type: 'http://gedcomx.org/Couple',
        person1: p1,
        person2: p2
      });
    }
  }

  // Spouses and children
  var $rows = document.querySelectorAll('#spouses-and-children tbody tr');
  for(var r = 0; r < $rows.length; r++){
    var $cells = $rows[r].querySelectorAll('td');
    if($cells.length < 3){
      continue;
    }

    var $spouseLink = $cells[1].querySelector('a[href*="/person/show/"]'),
        spouse = $spouseLink ? getRelative($spouseLink, persons, gedx) : null;

    if(spouse){
      var relationship = GedcomX.Relationship({
        type: 'http://gedcomx.org/Couple',
        person1: primary,
        person2: spouse
      });

      // Marriage date and place
      var spans = $cells[0].querySelectorAll('span'),
          marriageDate = spans[0] ? cleanDate(spans[0].textContent) : null,
          marriagePlace = spans[1] ? spans[1].textContent.trim() : null;
      if(marriageDate || marriagePlace){
        var marriage = GedcomX.Fact({type: 'http://gedcomx.org/Marriage'});
        if(marriageDate){
          marriage.setDate({original: marriageDate});
        }
        if(marriagePlace){
          marriage.setPlace({original: marriagePlace});
        }
        relationship.addFact(marriage);
      }
      gedx.addRelationship(relationship);
    }

    var $children = $cells[2].querySelectorAll('li');
    for(var c = 0; c < $children.length; c++){
      var $childLink = $children[c].querySelector('a[href*="/person/show/"]');
      if(!$childLink){
        continue;
      }
      var child = getRelative($childLink, persons, gedx);
      if(!child){
        continue;
      }
      var $date = $children[c].querySelector('span'),
          birthDate = $date ? cleanDate($date.textContent) : null;
      if(birthDate && !(child.getFacts() || []).length){
        child.addFact(GedcomX.Fact({
          type: 'http://gedcomx.org/Birth',
          date: {original: birthDate}
        }));
      }
      addParentChild(gedx, primary, child);
      if(spouse){
        addParentChild(gedx, spouse, child);
      }
    }
  }

  // Agent
  gedx.addAgent(GedcomX.Agent()
    .setId('agent')
    .addName({
      lang: 'de',
      value: 'GEDBAS'
    })
    .setHomepage({
      resource: 'https://gedbas.genealogy.net'
    }));

  // SourceDescription
  var title = document.title || ('GEDBAS - ' + name);
  gedx.addSourceDescriptionToAll({
    about: document.location.href,
    titles: [
      {
        value: title
      }
    ],
    citations: [
      {
        value: '"' + title + '," GEDBAS (' + document.location.href
          + ' : accessed ' + utils.getDateString() + ')'
      }
    ],
    repository: {
      resource: '#agent'
    }
  });

  emitter.emit('data', gedx);
}

function getId(url){
  var match = (url || '').match(/\/person\/show\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Create a person. GEDBAS writes surnames in uppercase ("Johann Carl SCHLARB").
 */
function createPerson(id, name){
  var person = GedcomX.Person({
    id: id,
    identifiers: {
      'genscrape': 'genscrape://gedbas/' + id
    }
  });

  var words = name.split(' '),
      surnameWords = [],
      givenWords = words.slice();

  while(givenWords.length > 1){
    var last = givenWords[givenWords.length - 1];
    if(last === last.toUpperCase() && last !== last.toLowerCase()){
      surnameWords.unshift(givenWords.pop());
    } else {
      break;
    }
  }

  if(surnameWords.length){
    var nameForm = GedcomX.NameForm();
    nameForm.setFullText(name);
    nameForm.addPart({type: 'http://gedcomx.org/Given', value: givenWords.join(' ')});
    nameForm.addPart({type: 'http://gedcomx.org/Surname', value: surnameWords.join(' ')});
    person.addName(GedcomX.Name().addNameForm(nameForm));
  } else {
    person.addSimpleName(name);
  }

  return person;
}

function getRelative($link, persons, gedx){
  var id = getId($link.getAttribute('href'));
  if(!id){
    return null;
  }
  if(!persons[id]){
    persons[id] = createPerson(id, $link.textContent.replace(/\s+/g, ' ').trim());
    gedx.addPerson(persons[id]);
  }
  return persons[id];
}

function addParentChild(gedx, parent, child){
  gedx.addRelationship({
    type: 'http://gedcomx.org/ParentChild',
    person1: parent,
    person2: child
  });
}

/**
 * Remove the day-number dot used by the site: "3. January 1910" -> "3 January 1910"
 */
function cleanDate(text){
  return (text || '').replace(/\s+/g, ' ').replace(/(^|\s)(\d{1,2})\./g, '$1$2').trim();
}

/**
 * Add facts from the rows of a characteristics ("Type, Value, Date, Place, Sources")
 * or events ("Type, Date, Place, Sources") table.
 *
 * @param {GedcomX.Person} person
 * @param {NodeList} $rows
 * @param {Boolean} hasValue Whether the table has a Value column
 */
function addFacts(person, $rows, hasValue){
  for(var i = 0; i < $rows.length; i++){
    var $cells = $rows[i].querySelectorAll('td'),
        offset = hasValue ? 1 : 0;

    if($cells.length < 3 + offset){
      continue;
    }

    var typeName = $cells[0].textContent.trim().toLowerCase(),
        type = FACT_TYPES[typeName];
    if(!type){
      // Names are handled elsewhere; unknown types are skipped
      continue;
    }

    var value = hasValue ? $cells[1].textContent.replace(/\s+/g, ' ').trim() : null,
        $dateSpans = $cells[1 + offset].querySelectorAll('span'),
        date = cleanDate($dateSpans.length ? $dateSpans[$dateSpans.length - 1].textContent : $cells[1 + offset].textContent),
        $placeSpan = $cells[2 + offset].querySelector('span'),
        place = ($placeSpan ? $placeSpan.textContent : $cells[2 + offset].textContent).replace(/\s+/g, ' ').trim();

    if(!date && !place && !value){
      continue;
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
    person.addFact(fact);
  }
}
