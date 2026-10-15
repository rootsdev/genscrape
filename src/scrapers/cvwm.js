var debug = require('debug')('genscrape:scrapers:cvwm'),
    utils = require('../utils'),
    GedcomX = require('gedcomx-js');

var urls = [
  utils.urlPatternToRegex("https://www.veterans.gc.ca/eng/remembrance/memorials/canadian-virtual-war-memorial/detail/*"),
  utils.urlPatternToRegex("https://www.veterans.gc.ca/en/remembrance/memorials/canadian-virtual-war-memorial/detail/*"),
  utils.urlPatternToRegex("https://veterans.gc.ca/eng/remembrance/memorials/canadian-virtual-war-memorial/detail/*"),
  utils.urlPatternToRegex("https://veterans.gc.ca/en/remembrance/memorials/canadian-virtual-war-memorial/detail/*")
];

module.exports = function(register){
  register(urls, run);
};

function run(emitter){

  debug('run');

  var $h1 = document.querySelector('.casualty h1, main h1'),
      $profile = document.querySelector('.casualty-profile');

  if(!$h1 || !$profile){
    return emitter.emit('noData');
  }

  var id = getRecordId(document.location.href),
      fields = readFields(),
      fullTitle = text($h1),
      name = fullTitle,
      gedx = new GedcomX(),
      person = GedcomX.Person({
        id: id,
        principal: true,
        identifiers: {
          'genscrape': 'genscrape://cvwm/' + id
        }
      });

  // Strip the rank from the title
  var rank = fields['Rank'];
  if(rank && fullTitle.indexOf(rank + ' ') === 0){
    name = fullTitle.substr(rank.length + 1);
  }
  person.addSimpleName(name);

  // Birth, Death
  addEvent(person, 'http://gedcomx.org/Birth', fields['Birth']);
  addEvent(person, 'http://gedcomx.org/Death', fields['Death']);

  // Burial / memorial
  var $cemetery = document.querySelector('a[href="#cemetery"]');
  if($cemetery){
    var burial = GedcomX.Fact({
      type: 'http://gedcomx.org/Burial',
      place: {
        original: utils.toTitleCase(text($cemetery).toLowerCase())
      }
    });
    if(fields['Grave reference']){
      burial.setValue(fields['Grave reference'].replace(/\.$/, ''));
    }
    person.addFact(burial);
  }

  // Military service
  var service = [];
  ['Rank', 'Force', 'Unit/Regiment', 'Division'].forEach(function(key){
    if(fields[key]){
      service.push(fields[key]);
    }
  });
  if(fields['Service number']){
    service.push('Service number ' + fields['Service number']);
  }
  if(service.length){
    var serviceFact = GedcomX.Fact({
      type: 'http://gedcomx.org/MilitaryService',
      value: service.join('; ')
    });
    var enlistment = splitDatePlace(fields['Enlistment']);
    if(enlistment.date){
      serviceFact.setDate({original: enlistment.date});
    }
    if(enlistment.place){
      serviceFact.setPlace({original: enlistment.place});
    }
    person.addFact(serviceFact);
  }

  // Additional information: parents and spouse
  var relatives = [];
  var $additional = document.querySelector('.field--name-field-additional-information .field--item');
  if($additional){
    relatives = parseAdditionalInfo(text($additional), person);
  }

  gedx.addPerson(person);

  relatives.forEach(function(rel){
    var relative = gedx.addRelativeFromName(person, rel.name, rel.type);
    if(rel.gender){
      relative.setGender({type: rel.gender});
    }
  });

  // Agent
  gedx.addAgent(GedcomX.Agent()
    .setId('agent')
    .addName({
      lang: 'en',
      value: 'Veterans Affairs Canada'
    })
    .setHomepage({
      resource: 'https://www.veterans.gc.ca'
    }));

  // SourceDescription
  gedx.addSourceDescriptionToAll({
    about: document.location.href,
    titles: [
      {
        value: fullTitle + ' - The Canadian Virtual War Memorial'
      }
    ],
    citations: [
      {
        value: 'Veterans Affairs Canada, "The Canadian Virtual War Memorial: ' + fullTitle + '" ('
          + document.location.href + ' : accessed ' + utils.getDateString() + ').'
      }
    ],
    repository: {
      resource: '#agent'
    }
  });

  emitter.emit('data', gedx);
}

function text($el){
  return $el ? $el.textContent.replace(/\s+/g, ' ').trim() : '';
}

/**
 * Read the labeled profile fields into an object
 */
function readFields(){
  var fields = {};
  Array.prototype.forEach.call(document.querySelectorAll('.profile-field'), function($field){
    var $label = $field.querySelector('.views-label'),
        $value = $field.querySelector('.field-content');
    if($label && $value){
      fields[text($label).replace(/:$/, '')] = text($value);
    }
  });
  return fields;
}

/**
 * Split "November 25, 1918 Montreal, Québec" into date and place
 */
function splitDatePlace(value){
  if(!value){
    return {};
  }
  var match = value.match(/^((?:[A-Z][a-z]+ )?(?:\d{1,2}, )?\d{4})\s*(.*)$/);
  if(match){
    return {date: match[1], place: match[2]};
  }
  return {place: value};
}

function addEvent(person, type, value){
  var parts = splitDatePlace(value);
  if(parts.date || parts.place){
    var fact = GedcomX.Fact({type: type});
    if(parts.date){
      fact.setDate({original: parts.date});
    }
    if(parts.place){
      fact.setPlace({original: parts.place});
    }
    person.addFact(fact);
  }
}

/**
 * Parse text such as "Son of John and Mary Warman, of Beenham, Berks, England;
 * husband of Flora Warman, of 2, Eastbrook Rd., Portslade, Sussex, England."
 *
 * @param {String} info
 * @param {GedcomX.Person} person Principal person; gender is set when implied
 * @return {Object[]} List of {name, type, gender}
 */
function parseAdditionalInfo(info, person){
  var relatives = [];

  info.split(/;\s*/).forEach(function(clause){
    var match = clause.match(/^(Son|Daughter|Husband|Wife) of (.+)$/i);
    if(!match){
      return;
    }

    var kind = match[1].toLowerCase(),
        // Remove residence info: ", of Beenham, Berks"
        names = match[2].split(/,\s+of\s+/)[0].replace(/[\s.]+$/, '');

    switch(kind){
      case 'son':
      case 'daughter':
        person.setGender({
          type: kind === 'son' ? 'http://gedcomx.org/Male' : 'http://gedcomx.org/Female'
        });
        splitParents(names).forEach(function(parent){
          relatives.push({name: parent, type: 'Parent'});
        });
        break;
      case 'husband':
      case 'wife':
        person.setGender({
          type: kind === 'husband' ? 'http://gedcomx.org/Male' : 'http://gedcomx.org/Female'
        });
        relatives.push({
          name: names,
          type: 'Couple',
          gender: kind === 'husband' ? 'http://gedcomx.org/Female' : 'http://gedcomx.org/Male'
        });
        break;
    }
  });

  return relatives;
}

/**
 * Split "John and Mary Warman" into ["John Warman", "Mary Warman"]. A first
 * name without a surname borrows the surname of the second.
 *
 * @param {String} names
 * @return {String[]}
 */
function splitParents(names){
  var parts = names.split(/\s+and\s+/);
  if(parts.length === 2){
    var second = parts[1].split(' ');
    if(parts[0].indexOf(' ') === -1 && second.length > 1){
      parts[0] = parts[0] + ' ' + second[second.length - 1];
    }
  }
  return parts.filter(function(p){ return p; });
}

function getRecordId(url){
  var match = url.match(/\/detail\/(\d+)/);
  return match ? match[1] : undefined;
}
