var debug = require('debug')('genscrape:scrapers:fold3-memorial'),
    utils = require('../utils'),
    GedcomX = require('gedcomx-js');

var urls = [
  utils.urlPatternToRegex("https://www.fold3.com/memorial/*"),
  utils.urlPatternToRegex("https://fold3.com/memorial/*")
];

module.exports = function(register){
  register(urls, run);
};

// Timeline event labels that map directly to GedcomX fact types
var eventTypes = {
  'birth': 'http://gedcomx.org/Birth',
  'death': 'http://gedcomx.org/Death',
  'burial': 'http://gedcomx.org/Burial',
  'marriage': 'http://gedcomx.org/Marriage',
  'divorce': 'http://gedcomx.org/Divorce',
  'baptism': 'http://gedcomx.org/Baptism',
  'christening': 'http://gedcomx.org/Christening',
  'residence': 'http://gedcomx.org/Residence',
  'immigration': 'http://gedcomx.org/Immigration',
  'emigration': 'http://gedcomx.org/Emigration',
  'naturalization': 'http://gedcomx.org/Naturalization',
  'cremation': 'http://gedcomx.org/Cremation',
  'census': 'http://gedcomx.org/Census',
  'occupation': 'http://gedcomx.org/Occupation',
  'education': 'http://gedcomx.org/Education'
};

function run(emitter){

  debug('run');

  var $name = document.querySelector('h1.page-title'),
      $events = document.querySelectorAll('.StoryPageEvent');

  if(!$name || !$events.length){
    return emitter.emit('noData');
  }

  var id = getRecordId(document.location.href),
      gedx = new GedcomX(),
      person = GedcomX.Person({
        id: id,
        principal: true,
        identifiers: {
          'genscrape': 'genscrape://fold3-memorial/' + id
        }
      }),
      names = [],
      relatives = [],
      servicePieces = {},
      awards = [];

  // Primary name
  var primaryName = text($name);
  person.addSimpleName(primaryName);
  names.push(primaryName);

  var $timeline = document.querySelector('.StoryPageEventsSection');

  Array.prototype.forEach.call($events, function($event){

    var inTimeline = $timeline && $timeline.contains($event);

    if(inTimeline) {
      if($event.classList.contains('military-service-event')){
        readMilitary($event, servicePieces, awards);
      } else {
        readTimelineEvent($event, person);
      }
    } else {
      readOtherFacts($event, person, names, relatives);
    }
  });

  // Military service
  var service = buildMilitaryService(servicePieces);
  if(service){
    person.addFact(service);
  }
  awards.forEach(function(award){
    person.addFact({
      type: 'http://gedcomx.org/MilitaryAward',
      value: award
    });
  });

  gedx.addPerson(person);

  // Relatives
  relatives.forEach(function(rel){
    gedx.addRelativeFromName(person, rel.name, rel.type);
  });

  // Agent
  gedx.addAgent(GedcomX.Agent()
    .setId('agent')
    .addName({
      lang: 'en',
      value: 'Fold3'
    })
    .setHomepage({
      resource: 'https://www.fold3.com'
    }));

  // SourceDescription
  var title = document.title.replace(/\s*-\s*Fold3\s*$/, '') + ' - Fold3 Memorial';
  gedx.addSourceDescriptionToAll({
    about: document.location.href,
    titles: [
      {
        value: title
      }
    ],
    citations: [
      {
        value: 'Fold3, "' + primaryName + '" (' + document.location.href
          + ' : accessed ' + utils.getDateString() + '), memorial page.'
      }
    ],
    repository: {
      resource: '#agent'
    }
  });

  emitter.emit('data', gedx);
}

/**
 * Get trimmed, whitespace-normalized text of an element
 *
 * @param {Element} $el
 * @return {String}
 */
function text($el){
  return $el ? $el.textContent.replace(/\s+/g, ' ').trim() : '';
}

/**
 * Read a labeled fact such as "Rank" + "First Lieutenant"
 *
 * @param {Element} $fact .StoryPageFact
 * @return {Object} {label, value, date, extras} where label may be undefined
 */
function readFact($fact){
  var $value = $fact.querySelector('.fact-value');
  if(!$value){
    return null;
  }

  var $inlineLabel = null,
      $children = $value.children;

  // Case 1: <div class="text-uppercase">Label</div><div>Value</div>
  if($children.length >= 2 && $children[0].classList.contains('text-uppercase')
      && $children[0].tagName === 'DIV'){
    return {
      label: text($children[0]),
      value: text($children[1])
    };
  }

  // Case 2: <span class="text-uppercase">Birth</span><span class="ms-1">- <span>Date</span></span>
  if($children.length && $children[0].tagName === 'SPAN' && $children[0].classList.contains('text-uppercase')){
    var date = $children[1] ? text($children[1].querySelector('span') || $children[1]) : '';
    return {
      label: text($children[0]),
      date: date
    };
  }

  // Case 3: unlabeled value
  return {
    value: text($value)
  };
}

/**
 * Read a timeline event (Birth, Death, Burial, etc)
 *
 * @param {Element} $event
 * @param {GedcomX.Person} person
 */
function readTimelineEvent($event, person){
  var label, date, values = [], labeled = {};

  // Burial style events have a header instead of an inline label
  var $label = $event.querySelector('h3.event-label .text-uppercase');
  if($label){
    label = text($label);
  }

  Array.prototype.forEach.call($event.querySelectorAll('.StoryPageFact'), function($fact){
    var fact = readFact($fact);
    if(!fact){
      return;
    }
    if(fact.label && fact.date !== undefined && !label){
      label = fact.label;
      date = fact.date;
    } else if(fact.label){
      labeled[fact.label.toLowerCase()] = fact.value;
    } else if(fact.value){
      values.push(fact.value);
    }
  });

  var type = label && eventTypes[label.toLowerCase()];
  if(!type){
    return;
  }

  var place;
  switch(type){
    case 'http://gedcomx.org/Burial':
      place = burialPlace(values);
      break;
    case 'http://gedcomx.org/Death':
      place = choosePlace(values);
      break;
    default:
      place = values[0];
  }

  var fact = GedcomX.Fact({type: type});
  if(date){
    fact.setDate({original: date});
  }
  if(place){
    fact.setPlace({original: place});
  }
  if(date || place){
    person.addFact(fact);
  }
}

/**
 * Pick the most place-like value: one with a comma, otherwise the first.
 *
 * @param {String[]} values
 * @return {String}
 */
function choosePlace(values){
  for(var i = 0; i < values.length; i++){
    if(values[i].indexOf(',') !== -1){
      return values[i];
    }
  }
  return values[0];
}

/**
 * Determine the burial place from the unlabeled values. These typically include
 * a verbose summary ("Buried at: ..." or "Missing in Action..."), possibly a
 * cemetery name, and possibly a locality.
 *
 * @param {String[]} values
 * @return {String}
 */
function burialPlace(values){
  var candidates = values.filter(function(v){
    return !/^(Buried at:|Missing in Action)/i.test(v);
  });
  if(candidates.length <= 1){
    return candidates[0] || values[0];
  }
  var locality = choosePlace(candidates),
      cemetery = candidates.filter(function(v){ return v !== locality; })[0];
  return cemetery + ', ' + locality;
}

/**
 * Collect military details from a military-service-event
 */
function readMilitary($event, pieces, awards){
  var $start = $event.querySelector('[itemprop="startDate"]'),
      $end = $event.querySelector('[itemprop="endDate"]'),
      $war = $event.querySelector('h3 [itemprop="name"]');

  if($start){
    pieces.start = text($start);
  }
  if($end){
    pieces.end = text($end);
  }
  if($war){
    pieces.war = text($war);
  }

  Array.prototype.forEach.call($event.querySelectorAll('.StoryPageFact'), function($fact){
    var fact = readFact($fact);
    if(!fact || !fact.label || !fact.value){
      return;
    }
    var label = fact.label.toLowerCase();
    switch(label){
      case 'rank':
      case 'regiment':
      case 'unit':
      case 'branch':
      case 'service number':
      case 'served for':
        if(!pieces[label]){
          pieces[label] = fact.value;
        }
        break;
      case 'award':
      case 'awards':
        fact.value.split(/\s*,\s*(?=[A-Z])/).forEach(function(award){
          if(award && awards.indexOf(award) === -1){
            awards.push(award);
          }
        });
        break;
    }
  });
}

/**
 * Build a MilitaryService fact from the collected details
 */
function buildMilitaryService(pieces){
  var parts = [];
  if(pieces.war){
    parts.push(pieces.war);
  }
  if(pieces.rank){
    parts.push(pieces.rank);
  }
  if(pieces.regiment || pieces.unit){
    parts.push(pieces.regiment || pieces.unit);
  }
  if(pieces.branch){
    parts.push(pieces.branch);
  }
  if(pieces['service number']){
    parts.push('Service number ' + pieces['service number']);
  }
  if(!parts.length && !pieces.war){
    return null;
  }

  var fact = GedcomX.Fact({
    type: 'http://gedcomx.org/MilitaryService',
    value: parts.join('; ')
  });

  var date = pieces.start && pieces.end ? pieces.start + ' - ' + pieces.end : pieces.start;
  if(date){
    fact.setDate({original: date});
  }
  return fact;
}

/**
 * Read the "Other Facts" blocks: alternate names, gender, relatives, etc.
 */
function readOtherFacts($event, person, names, relatives){
  Array.prototype.forEach.call($event.querySelectorAll('.StoryPageFact'), function($fact){
    var fact = readFact($fact);
    if(!fact || !fact.label || !fact.value){
      return;
    }

    var value = fact.value;
    switch(fact.label.toLowerCase()){
      case 'full name':
      case 'also known as':
      case 'maiden name':
        if(names.indexOf(value) === -1){
          names.push(value);
          person.addSimpleName(value);
        }
        break;
      case 'gender':
        if(/^male$/i.test(value)){
          person.setGender({type: 'http://gedcomx.org/Male'});
        } else if(/^female$/i.test(value)){
          person.setGender({type: 'http://gedcomx.org/Female'});
        }
        break;
      case 'father':
      case 'mother':
        addRelative(relatives, value, 'Parent');
        break;
      case 'child':
      case 'son':
      case 'daughter':
        addRelative(relatives, value, 'Child');
        break;
      case 'spouse':
      case 'husband':
      case 'wife':
      case 'partner':
        addRelative(relatives, value, 'Couple');
        break;
      case 'place of residence':
        person.addFact({
          type: 'http://gedcomx.org/Residence',
          place: {original: value}
        });
        break;
      case 'occupation':
        person.addFact({
          type: 'http://gedcomx.org/Occupation',
          value: value
        });
        break;
      case 'religion':
        person.addFact({
          type: 'http://gedcomx.org/Religion',
          value: value
        });
        break;
      case 'race or ethnicity':
        person.addFact({
          type: 'http://gedcomx.org/Ethnicity',
          value: value
        });
        break;
    }
  });
}

function addRelative(relatives, name, type){
  var exists = relatives.some(function(r){
    return r.name === name && r.type === type;
  });
  if(!exists){
    relatives.push({name: name, type: type});
  }
}

/**
 * Get the memorial ID from the URL
 *
 * @param {String} url
 * @return {String}
 */
function getRecordId(url){
  var match = url.match(/\/memorial\/(\d+)/);
  return match ? match[1] : undefined;
}
