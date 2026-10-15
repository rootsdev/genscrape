var debug = require('debug')('genscrape:scrapers:rodovid'),
    utils = require('../utils'),
    GedcomX = require('gedcomx-js');

var urls = [
  utils.urlPatternToRegex("https://*.rodovid.org/wk/Person:*"),
  utils.urlPatternToRegex("http://*.rodovid.org/wk/Person:*"),
  utils.urlPatternToRegex("https://rodovid.org/wk/Person:*")
];

var factTypes = {
  'birth': 'http://gedcomx.org/Birth',
  'death': 'http://gedcomx.org/Death',
  'burial': 'http://gedcomx.org/Burial',
  'baptism': 'http://gedcomx.org/Baptism',
  'christening': 'http://gedcomx.org/Christening',
  'cremation': 'http://gedcomx.org/Cremation',
  'occupation': 'http://gedcomx.org/Occupation',
  'residence': 'http://gedcomx.org/Residence',
  'emigration': 'http://gedcomx.org/Emigration',
  'immigration': 'http://gedcomx.org/Immigration',
  'education': 'http://gedcomx.org/Education',
  'religion': 'http://gedcomx.org/Religion',
  'nationality': 'http://gedcomx.org/Nationality'
};

var valueFactTypes = [
  'http://gedcomx.org/Occupation',
  'http://gedcomx.org/Education',
  'http://gedcomx.org/Religion',
  'http://gedcomx.org/Nationality'
];

module.exports = function(register){
  register(urls, run);
};

function run(emitter){
  debug('run');

  var $content = document.getElementById('mw-content-text'),
      $table = document.querySelector('table.persondata'),
      id = getRecordId(document.location.href);

  if(!$content || !$table || !id){
    return emitter.emit('noData');
  }

  var gedx = new GedcomX(),
      fields = getFields($table),
      person = GedcomX.Person({
        id: id,
        principal: true,
        identifiers: {
          'genscrape': getRecordIdentifier(id)
        }
      }),
      relatives = {};

  gedx.addPerson(person);

  // Name. The lineage is the surname.
  var fullName = clean(fields['Full name (at birth)']),
      lineage = clean(fields['Lineage']);
  if(fullName){
    if(lineage && lineage !== '?' && fullName.length > lineage.length + 1
        && fullName.slice(-lineage.length - 1) === ' ' + lineage){
      person.addNameFromParts({
        'http://gedcomx.org/Given': fullName.slice(0, -lineage.length - 1),
        'http://gedcomx.org/Surname': lineage
      });
    } else {
      person.addSimpleName(fullName);
    }
  }

  setGender(person, fields['Sex']);

  // Parents
  var parentsCell = findParentsCell($table);
  if(parentsCell){
    toArray(parentsCell.querySelectorAll('p.event')).forEach(function(p){
      var parent = getRelative(gedx, relatives, p);
      if(parent){
        addRelationship(gedx, 'http://gedcomx.org/ParentChild', parent, person);
      }
    });
  }

  // Events
  toArray($content.children).filter(function(el){
    return el.tagName === 'P' && el.classList.contains('event');
  }).forEach(function(p){
    var event = parseEvent(p);
    if(!event){
      return;
    }

    var type = event.type;

    if(type === 'child birth'){
      var child = getRelative(gedx, relatives, p);
      if(child){
        addRelationship(gedx, 'http://gedcomx.org/ParentChild', person, child);
      }
    }

    else if(type === 'marriage' || type === 'divorce' || type === 'partnership' || type === 'engagement'){
      var spouse = getRelative(gedx, relatives, p),
          factType = type === 'marriage' ? 'http://gedcomx.org/Marriage'
            : (type === 'divorce' ? 'http://gedcomx.org/Divorce' : null),
          fact = factType ? createFact(factType, event) : null;
      if(spouse){
        var rel = addRelationship(gedx, 'http://gedcomx.org/Couple', person, spouse);
        if(fact){
          rel.addFact(fact);
        }
      }
      if(fact){
        person.addFact(createFact(factType, event));
      }
    }

    else if(factTypes[type]){
      var f = createFact(factTypes[type], event);
      if(f){
        person.addFact(f);
      }
    }
  });

  // Agent
  gedx.addAgent(GedcomX.Agent()
    .setId('agent')
    .addName({
      lang: 'en',
      value: 'Rodovid'
    })
    .setHomepage({
      resource: 'https://rodovid.org'
    }));

  // SourceDescription
  gedx.addSourceDescriptionToAll({
    about: document.location.href,
    titles: [
      {
        value: document.title
      }
    ],
    citations: [
      {
        value: document.title + ' (' + document.location.href
          + ' : accessed ' + utils.getDateString() + ')'
      }
    ],
    repository: {
      resource: '#agent'
    }
  });

  emitter.emit('data', gedx);
}

function toArray(list){
  return Array.prototype.slice.call(list);
}

function clean(str){
  return (str || '').replace(/\s+/g, ' ').trim();
}

/**
 * Convert the persondata table's label/value rows into an object
 */
function getFields($table){
  var fields = {};
  toArray($table.querySelectorAll('tr')).forEach(function(tr){
    var $label = tr.querySelector('td.fld'),
        $value = $label && $label.nextElementSibling;
    if($label && $value){
      fields[clean($label.textContent)] = clean($value.textContent);
    }
  });
  return fields;
}

function findParentsCell($table){
  var cells = toArray($table.querySelectorAll('td[colspan]'));
  for(var i = 0; i < cells.length; i++){
    var b = cells[i].querySelector('b');
    if(b && clean(b.textContent) === 'Parents'){
      return cells[i];
    }
  }
}

function setGender(person, sex){
  switch((sex || '').toLowerCase()){
    case 'male':
      person.setGender({type: 'http://gedcomx.org/Male'});
      break;
    case 'female':
      person.setGender({type: 'http://gedcomx.org/Female'});
      break;
  }
}

/**
 * Parse an event paragraph: `<b>date </b>type: place, place, <person link> b. x d. y`
 */
function parseEvent(p){
  var $date = p.querySelector('b'),
      text = clean(p.textContent),
      date = $date ? cleanDate($date.textContent) : '';

  if($date){
    text = clean(text.replace(clean($date.textContent), ''));
  }

  var colon = text.indexOf(':');
  if(colon === -1){
    return null;
  }

  var type = text.slice(0, colon).trim().toLowerCase(),
      value = text.slice(colon + 1).trim(),
      places = toArray(p.querySelectorAll('a[href*="/wk/Place:"]'))
        .map(function(a){ return clean(a.textContent); })
        .filter(function(s){ return s && s !== '?'; });

  return {
    type: type,
    date: date,
    place: places.join(', '),
    value: value
  };
}

function cleanDate(str){
  str = clean(str);
  if(/^(about|before|after|\?)?$/i.test(str)){
    return '';
  }
  return str;
}

function createFact(type, event){
  var fact = GedcomX.Fact({type: type});
  if(event.date){
    fact.setDate({original: event.date});
  }
  if(event.place){
    fact.setPlace({original: event.place});
  }
  if(valueFactTypes.indexOf(type) !== -1 && event.value){
    fact.setValue(event.value);
  }
  if(!event.date && !event.place && !fact.getValue()){
    return;
  }
  return fact;
}

/**
 * Get (or create) the relative linked to in an element
 */
function getRelative(gedx, relatives, el){
  var $link = el.querySelector('a[href*="/wk/Person:"]');
  if(!$link){
    return;
  }

  var id = getRecordId($link.getAttribute('href'));
  if(!id){
    return;
  }
  if(relatives[id]){
    return relatives[id];
  }

  var relative = GedcomX.Person({
    id: id,
    identifiers: {
      'genscrape': getRecordIdentifier(id)
    }
  });

  var name = clean($link.textContent).replace(/\?/g, '').replace(/\(\s*\)/g, '');
  relative.addSimpleName(clean(name));

  // Gender symbol precedes the person link
  var $gender = $link.previousElementSibling;
  if($gender){
    var symbol = clean($gender.textContent);
    setGender(relative, symbol === '♂' ? 'male' : (symbol === '♀' ? 'female' : ''));
  }

  // Lifespan text follows the link: ` b. date d. date`
  var after = clean(getTextAfter($link)),
      born = after.match(/(?:^|\s)b\. (.*?)(?= d\. |$)/),
      died = after.match(/(?:^|\s)d\. (.*)$/);
  if(born && cleanDate(born[1])){
    relative.addFact(GedcomX.Fact({
      type: 'http://gedcomx.org/Birth',
      date: {original: cleanDate(born[1])}
    }));
  }
  if(died && cleanDate(died[1])){
    relative.addFact(GedcomX.Fact({
      type: 'http://gedcomx.org/Death',
      date: {original: cleanDate(died[1])}
    }));
  }

  gedx.addPerson(relative);
  relatives[id] = relative;
  return relative;
}

function getTextAfter($el){
  var text = '', node = $el.nextSibling;
  while(node){
    text += node.textContent;
    node = node.nextSibling;
  }
  return text;
}

function addRelationship(gedx, type, person1, person2){
  var existing = gedx.getRelationships().filter(function(r){
    return r.getType() === type
      && r.getPerson1().getResource() === '#' + person1.getId()
      && r.getPerson2().getResource() === '#' + person2.getId();
  })[0];
  if(existing){
    return existing;
  }
  var rel = GedcomX.Relationship({
    type: type,
    person1: person1,
    person2: person2
  });
  gedx.addRelationship(rel);
  return rel;
}

function getRecordId(url){
  var match = (url || '').match(/Person:(\d+)/);
  return match ? match[1] : undefined;
}

function getRecordIdentifier(id){
  return 'genscrape://rodovid/' + id;
}
