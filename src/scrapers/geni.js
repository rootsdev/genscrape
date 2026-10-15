var debug = require('debug')('genscrape:scrapers:geni'),
    utils = require('../utils'),
    GedcomX = require('gedcomx-js');

var urls = [
  /^https?:\/\/(www\.)?geni\.com\/people\/[^\/?#]+\/\d+/
];

module.exports = function(register){
  register(urls, run);
};

function run(emitter){
  debug('run');

  var id = getRecordId(document.location.href),
      $birth = document.getElementById('birth_date'),
      $table = findTable($birth) || document.querySelector('table.data_table'),
      $name = document.querySelector('[itemprop="mainEntity"] > h1[itemprop="name"]')
        || document.querySelector('h1[itemprop="name"]');

  if(!id || !$table || !$name){
    return emitter.emit('noData');
  }

  var gedx = new GedcomX(),
      person = GedcomX.Person({
        id: id,
        principal: true,
        identifiers: {
          'genscrape': getRecordIdentifier(id)
        }
      }),
      relatives = {},
      rows = getRows($table);

  gedx.addPerson(person);
  person.addSimpleName(baseName($name.textContent));

  // Facts
  var birthDate = rows['Birthdate'] && clean(rows['Birthdate'].textContent),
      birthPlace = rows['Birthplace'] && clean(rows['Birthplace'].textContent);
  addFact(person, 'http://gedcomx.org/Birth', birthDate, birthPlace);

  if(rows['Death']){
    var death = parseDeath(rows['Death']);
    addFact(person, 'http://gedcomx.org/Death', death.date, death.place);
  }

  if(rows['Place of Burial']){
    addFact(person, 'http://gedcomx.org/Burial', null, clean(rows['Place of Burial'].textContent));
  }

  if(rows['Christening'] || rows['Baptism']){
    var $bap = rows['Christening'] || rows['Baptism'];
    addFact(person, $bap === rows['Christening'] ? 'http://gedcomx.org/Christening' : 'http://gedcomx.org/Baptism',
      null, clean($bap.textContent));
  }

  if(rows['Occupation']){
    var occupation = clean(rows['Occupation'].textContent);
    if(occupation){
      person.addFact({
        type: 'http://gedcomx.org/Occupation',
        value: occupation
      });
    }
  }

  // Family
  if(rows['Immediate Family']){
    parseFamily(gedx, person, relatives, rows['Immediate Family']);
  }

  // Agent
  gedx.addAgent(GedcomX.Agent()
    .setId('agent')
    .addName({
      lang: 'en',
      value: 'Geni'
    })
    .setHomepage({
      resource: 'https://www.geni.com'
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

/**
 * Remove trailing titles after a comma: `Mary Soames, Baroness Soames` -> `Mary Soames`
 */
function baseName(name){
  name = clean(name);
  var base = name.split(',')[0].trim();
  return base.indexOf(' ') !== -1 ? base : name;
}

function findTable($el){
  while($el && $el.tagName !== 'TABLE'){
    $el = $el.parentNode;
  }
  return $el || null;
}

function toArray(list){
  return Array.prototype.slice.call(list);
}

function clean(str){
  return (str || '').replace(/\s+/g, ' ').trim();
}

/**
 * Map of row label (without trailing colon) to value cell
 */
function getRows($table){
  var rows = {};
  toArray($table.querySelectorAll('tr')).forEach(function(tr){
    var cells = toArray(tr.children).filter(function(c){
      return c.tagName === 'TD' || c.tagName === 'TH';
    });
    if(cells.length === 2){
      var label = clean(cells[0].textContent).replace(/:$/, '');
      if(label){
        rows[label] = cells[1];
      }
    }
  });
  return rows;
}

/**
 * Death cell: `<span itemprop="deathDate">date</span> (age) <br> place (cause)`
 */
function parseDeath($cell){
  var $date = $cell.querySelector('[itemprop="deathDate"]'),
      date = $date ? clean($date.textContent) : '',
      place = '',
      parts = $cell.innerHTML.split(/<br\s*\/?>/i);

  if(parts.length > 1){
    var tmp = document.createElement('div');
    tmp.innerHTML = parts.slice(1).join(' ');
    place = clean(tmp.textContent).replace(/\s*\([^()]*\)$/, '');
  } else if(!$date) {
    date = clean($cell.textContent).replace(/\s*\(\d+\)$/, '');
  }

  return {date: date, place: place};
}

function addFact(person, type, date, place){
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
  person.addFact(fact);
}

/**
 * Parse the Immediate Family cell. It is a list of lines separated by `<br>`
 * such as `Son of <a>Father</a> and <a>Mother</a>` or `Father of <a>X</a>; <a>Y</a>`
 */
function parseFamily(gedx, person, relatives, $cell){
  var lines = [[]];

  toArray($cell.querySelectorAll('p')).forEach(function($p){
    toArray($p.childNodes).forEach(function(node){
      if(node.nodeType === 1 && node.tagName === 'BR'){
        lines.push([]);
      } else {
        lines[lines.length - 1].push(node);
      }
    });
  });

  lines.forEach(function(nodes){
    var label = clean(nodes.filter(function(n){
      return n.nodeType === 3;
    }).map(function(n){
      return n.textContent;
    })[0] || '');

    // Collapsed "N others" lists contain additional links inside spans
    var links = [];
    nodes.forEach(function(n){
      if(n.nodeType !== 1){
        return;
      }
      if(n.tagName === 'A'){
        links.push(n);
      } else {
        toArray(n.querySelectorAll('a')).forEach(function(a){
          links.push(a);
        });
      }
    });
    links = links.filter(function(a){
      return /geni\.com\/people\/[^\/]+\/\d+/.test(a.getAttribute('href') || '');
    });

    if(!label || !links.length){
      return;
    }

    var lower = label.toLowerCase().replace(/\s+of$/, '');

    // Parents
    if(/^(biological |adopted |foster |step)?(son|daughter|child)$/.test(lower)){
      var parentType = /^biological/.test(lower) ? 'http://gedcomx.org/BiologicalParent'
        : (/^adopted/.test(lower) ? 'http://gedcomx.org/AdoptiveParent'
        : (/^foster/.test(lower) ? 'http://gedcomx.org/FosterParent' : null));
      if(/^step/.test(lower)){
        return;
      }
      if(/daughter/.test(lower)){
        person.setGender({type: 'http://gedcomx.org/Female'});
      } else if(/son/.test(lower)){
        person.setGender({type: 'http://gedcomx.org/Male'});
      }
      links.forEach(function(a){
        var parent = getRelative(gedx, relatives, a);
        if(parent){
          var rel = addRelationship(gedx, 'http://gedcomx.org/ParentChild', parent, person);
          if(parentType && !rel.getFacts().length){
            rel.addFact({type: parentType});
          }
        }
      });
    }

    // Spouses
    else if(/^(husband|wife|partner|ex-husband|ex-wife|ex-partner)$/.test(lower)){
      if(lower === 'husband'){
        person.setGender({type: 'http://gedcomx.org/Male'});
      } else if(lower === 'wife'){
        person.setGender({type: 'http://gedcomx.org/Female'});
      }
      links.forEach(function(a){
        var spouse = getRelative(gedx, relatives, a);
        if(spouse){
          addRelationship(gedx, 'http://gedcomx.org/Couple', person, spouse);
        }
      });
    }

    // Children
    else if(/^(father|mother|parent)$/.test(lower)){
      if(lower === 'father'){
        person.setGender({type: 'http://gedcomx.org/Male'});
      } else if(lower === 'mother'){
        person.setGender({type: 'http://gedcomx.org/Female'});
      }
      links.forEach(function(a){
        var child = getRelative(gedx, relatives, a);
        if(child){
          addRelationship(gedx, 'http://gedcomx.org/ParentChild', person, child);
        }
      });
    }
  });
}

function getRelative(gedx, relatives, $link){
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
  relative.addSimpleName(baseName($link.textContent));
  gedx.addPerson(relative);
  relatives[id] = relative;
  return relative;
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
  var match = (url || '').match(/geni\.com\/people\/[^\/?#]+\/(\d+)/);
  return match ? match[1] : undefined;
}

function getRecordIdentifier(id){
  return 'genscrape://geni/' + id;
}
