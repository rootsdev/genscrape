var debug = require('debug')('genscrape:scrapers:thepeerage'),
    utils = require('../utils'),
    GedcomX = require('gedcomx-js');

// Person pages only (pNNNN.htm). Place pages (pdNNN.htm) and source pages are excluded.
var urls = [
  /^https?:\/\/(?:www\.)?thepeerage\.com\/p\d+\.htm/
];

var MONTHS = 'January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec';
var DATE_REGEX = new RegExp('(?:(?:circa|c|before|after|say|between|about)\\.?\\s+)?(?:\\d{1,2}\\s+)?(?:(?:' + MONTHS + ')\\s+)?\\d{4}(?:\\s+and\\s+(?:\\d{1,2}\\s+)?(?:(?:' + MONTHS + ')\\s+)?\\d{4})?', 'g');

var NAME_CLASSES = {
  nt: 'http://gedcomx.org/Prefix',
  ng: 'http://gedcomx.org/Given',
  ns: 'http://gedcomx.org/Surname',
  nu: 'http://gedcomx.org/Suffix'
};

module.exports = function(register){
  register(urls, run);
};

function run(emitter){

  debug('run');

  var $person = getPrincipalElement();

  if(!$person){
    return emitter.emit('noData');
  }

  var gedx = new GedcomX(),
      persons = {},
      principalId = $person.id.replace(/^i/, ''),
      primary = GedcomX.Person({
        id: principalId,
        identifiers: {
          'genscrape': 'genscrape://thepeerage/' + principalId
        }
      });

  primary.setPrincipal(true);
  persons[principalId] = primary;
  gedx.addPerson(primary);

  // Name
  var $narr = $person.querySelector('.narr');
  var nameParts = {}, fullName = getHeadingText($person.querySelector('h2'));
  if($narr){
    for(var i = 0; i < $narr.children.length; i++){
      var type = nameTypeOf($narr.children[i]);
      if(type){
        nameParts[type] = (nameParts[type] ? nameParts[type] + ' ' : '') + $narr.children[i].textContent.trim();
      }
    }
  }
  addName(primary, nameParts, fullName);

  // Gender and dates from the summary line, e.g. "M, #91, b. 21 May 1772, d. 12 October 1863"
  var $info = $person.querySelector('.sinfo'),
      info = $info ? $info.textContent.trim() : '',
      infoMatch = info.match(/^([MF]),/);
  if(infoMatch){
    primary.setGender({
      type: infoMatch[1] === 'M' ? 'http://gedcomx.org/Male' : 'http://gedcomx.org/Female'
    });
  }

  var facts = {};
  var birthInfo = info.match(/\bb\. (.+?)(?:, d\. |$)/),
      deathInfo = info.match(/\bd\. (.+)$/);

  // Narrative
  if($narr){
    var sentences = getSentences($narr);
    sentences.forEach(function(sentence, index){
      debug('sentence', index, sentence);
      processSentence(sentence, primary, gedx, persons, facts, index === 0);
    });
  }

  // Fall back to summary line dates when the narrative did not have them
  if(birthInfo && !facts.birth){
    primary.addFact(makeFact('http://gedcomx.org/Birth', birthInfo[1], null));
  }
  if(deathInfo && !facts.death){
    primary.addFact(makeFact('http://gedcomx.org/Death', deathInfo[1], null));
  }

  // Children
  var $families = $person.querySelectorAll('.fams');
  for(var f = 0; f < $families.length; f++){
    var $heading = $families[f].querySelector('h3'),
        otherParent = null;
    if($heading){
      var $parentLink = $heading.querySelector('a');
      if($parentLink){
        otherParent = getRelative($parentLink, persons, gedx);
      }
    }
    var $items = $families[f].querySelectorAll('li');
    for(var c = 0; c < $items.length; c++){
      var $childLink = $items[c].querySelector('a');
      if(!$childLink){
        continue;
      }
      var child = getRelative($childLink, persons, gedx);
      if(!child){
        continue;
      }
      addDatesFromListItem(child, $items[c].textContent);
      addParentChild(gedx, primary, child);
      if(otherParent){
        addParentChild(gedx, otherParent, child);
        addCouple(gedx, primary, otherParent);
      }
    }
  }

  // Agent
  gedx.addAgent(GedcomX.Agent()
    .setId('agent')
    .addName({
      lang: 'en',
      value: 'thePeerage.com'
    })
    .setHomepage({
      resource: 'http://www.thepeerage.com'
    }));

  // SourceDescription
  var title = fullName + ' - thePeerage.com';
  gedx.addSourceDescriptionToAll({
    about: document.location.href,
    titles: [
      {
        value: title
      }
    ],
    citations: [
      {
        value: '"' + title + '," thePeerage.com (' + document.location.href
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
 * The principal person is identified by the URL hash (#i123). If there
 * isn't one, use the first person on the page.
 *
 * @return {Element}
 */
function getPrincipalElement(){
  var hash = document.location.hash;
  if(hash && hash.length > 1){
    var $el = document.getElementById(hash.substring(1));
    if($el && /(^|\s)itp(\s|$)/.test($el.className)){
      return $el;
    }
  }
  return document.querySelector('.itp');
}

function nameTypeOf($el){
  var classes = ($el.className || '').split(/\s+/);
  for(var i = 0; i < classes.length; i++){
    if(NAME_CLASSES[classes[i]]){
      return NAME_CLASSES[classes[i]];
    }
  }
  return null;
}

/**
 * Add a name to the person, using the parts if we have them
 */
function addName(person, nameParts, fullText){
  var hasParts = Object.keys(nameParts).length > 0;
  if(!hasParts){
    person.addSimpleName(fullText);
    return;
  }
  var nameForm = GedcomX.NameForm();
  var textParts = [];
  [
    'http://gedcomx.org/Prefix',
    'http://gedcomx.org/Given',
    'http://gedcomx.org/Surname',
    'http://gedcomx.org/Suffix'
  ].forEach(function(type){
    if(nameParts[type]){
      nameForm.addPart({type: type, value: nameParts[type]});
      textParts.push(nameParts[type]);
    }
  });
  nameForm.setFullText(fullText || textParts.join(' '));
  person.addName(GedcomX.Name().addNameForm(nameForm));
}

/**
 * Get a person for a link to another person; creates and adds them if needed.
 *
 * @param {Element} $link
 * @return {GedcomX.Person}
 */
function getRelative($link, persons, gedx){
  var href = $link.getAttribute('href') || '',
      match = href.match(/#i(\d+)$/);
  if(!match){
    return null;
  }
  var id = match[1];
  if(persons[id]){
    return persons[id];
  }
  var person = GedcomX.Person({
    id: id,
    identifiers: {
      'genscrape': 'genscrape://thepeerage/' + id
    }
  });

  var nameParts = {};
  for(var i = 0; i < $link.children.length; i++){
    var type = nameTypeOf($link.children[i]);
    if(type){
      var text = $link.children[i].textContent.trim();
      nameParts[type] = (nameParts[type] ? nameParts[type] + ' ' : '') + text;
    }
  }
  addName(person, nameParts, $link.textContent.replace(/\s+/g, ' ').trim());

  persons[id] = person;
  gedx.addPerson(person);
  return person;
}

function addParentChild(gedx, parent, child){
  gedx.addRelationship({
    type: 'http://gedcomx.org/ParentChild',
    person1: parent,
    person2: child
  });
}

function addCouple(gedx, p1, p2){
    if(gedx.getRelationships().some(function(r){
    return r.getType() === 'http://gedcomx.org/Couple' &&
      ((r.getPerson1().getResource() === '#' + p1.getId() && r.getPerson2().getResource() === '#' + p2.getId())
       || (r.getPerson1().getResource() === '#' + p2.getId() && r.getPerson2().getResource() === '#' + p1.getId()));
  })){
    return null;
  }
  return gedx.addRelationship({
    type: 'http://gedcomx.org/Couple',
    person1: p1,
    person2: p2
  });
}

/**
 * Child list items look like "Hon. Name d. 25 Dec 1911" or "... b. 1771, d. 1838"
 */
function addDatesFromListItem(person, text){
  text = text.replace(/\s+/g, ' ');
  var b = text.match(/\bb\. (.+?)(?:, d\. |$)/),
      d = text.match(/\bd\. (.+)$/);
  if(b && !hasFact(person, 'http://gedcomx.org/Birth')){
    person.addFact(makeFact('http://gedcomx.org/Birth', b[1].trim(), null));
  }
  if(d && !hasFact(person, 'http://gedcomx.org/Death')){
    person.addFact(makeFact('http://gedcomx.org/Death', d[1].trim(), null));
  }
}

function hasFact(person, type){
  return (person.getFacts() || []).some(function(fact){
    return fact.getType() === type;
  });
}

function makeFact(type, date, place){
  var fact = GedcomX.Fact({type: type});
  if(date){
    fact.setDate({original: date});
  }
  if(place){
    fact.setPlace({original: place});
  }
  return fact;
}

/**
 * Convert the narrative into an array of sentence strings. Person links are
 * turned into `<<id|text>>` tokens and place links into `[[text]]` tokens so
 * that they survive text processing.
 *
 * @param {Element} $narr
 * @return {String[]}
 */
var linkElements = {};

function getSentences($narr){
  var out = '';

  function walk(node){
    for(var n = node.firstChild; n; n = n.nextSibling){
      if(n.nodeType === 3){
        out += n.nodeValue;
      } else if(n.nodeType === 1){
        var tag = n.nodeName.toLowerCase(),
            cls = n.className || '';
        if(tag === 'sup' || /(^|\s)pid(\s|$)/.test(cls)){
          continue;
        }
        if(tag === 'br'){
          out += ' ';
        } else if(tag === 'a'){
          var href = n.getAttribute('href') || '',
              text = n.textContent.replace(/\s+/g, ' ').trim(),
              personMatch = href.match(/#i(\d+)$/);
          if(/^pd\d+\.htm/.test(href)){
            // A place ending in a dot (U.S.A.) doubles as the end of the sentence
            out += '[[' + text + ']]' + (/\.$/.test(text) ? '.' : '');
          } else if(personMatch){
            linkElements[personMatch[1]] = linkElements[personMatch[1]] || n;
            out += '<<' + personMatch[1] + '|' + text + '>>';
          } else {
            out += text;
          }
        } else {
          walk(n);
        }
      }
    }
  }
  walk($narr);

  out = out.replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

  // Hide dots inside tokens so we can split sentences on ". "
  out = out.replace(/(<<|\[\[)(.*?)(>>|\]\])/g, function(m){
    return m.replace(/\./g, '\u0001');
  });

  return out.split(/\.(?:\s+|$)/).map(function(s){
    return s.replace(/\u0001/g, '.').trim();
  }).filter(Boolean);
}

function stripTokens(s){
  return s.replace(/<<\d+\|(.*?)>>/g, '$1').replace(/\[\[(.*?)\]\]/g, '$1');
}

function findDate(text){
  var matches = text.match(DATE_REGEX);
  return matches ? matches[0] : null;
}

function findPlace(text){
  var m = text.match(/\[\[(.+?)\]\]/);
  return m ? m[1] : null;
}

var EVENTS = [
  {regex: /\bwas born\b(.*)$/, type: 'http://gedcomx.org/Birth', key: 'birth'},
  {regex: /\bwas (?:baptised|baptized)\b(.*)$/, type: 'http://gedcomx.org/Baptism'},
  {regex: /\bwas christened\b(.*)$/, type: 'http://gedcomx.org/Christening'},
  {regex: /\bdied\b(.*)$/, type: 'http://gedcomx.org/Death', key: 'death'},
  {regex: /\bwas buried\b(.*)$/, type: 'http://gedcomx.org/Burial'},
  {regex: /\bwas cremated\b(.*)$/, type: 'http://gedcomx.org/Cremation'},
  {regex: /\bwas (?:christened|confirmed)\b(.*)$/, type: 'http://gedcomx.org/Christening'},
  {regex: /\b(?:lived|resided)\b(.*)$/, type: 'http://gedcomx.org/Residence'},
  {regex: /\bemigrated\b(.*)$/, type: 'http://gedcomx.org/Emigration'},
  {regex: /\bimmigrated\b(.*)$/, type: 'http://gedcomx.org/Immigration'}
];

function processSentence(sentence, primary, gedx, persons, facts, isFirst){

  // Parents: "He was the son of <<>> and <<>>"
  var parentMatch = sentence.match(/\bwas the (?:son|daughter|child) of (.*)$/);
  if(parentMatch && (isFirst || /^(?:He|She) /.test(sentence))){
    var parentRe = /<<(\d+)\|(.*?)>>/g, m;
    // Only the first two links are parents (before any following clause)
    var chunkMatch = parentMatch[1].match(/^<<\d+\|.*?>>(?: and <<\d+\|.*?>>)?/),
        chunk = chunkMatch ? chunkMatch[0] : '';
    while((m = parentRe.exec(chunk))){
      var parent = getRelative(makeLink(m[1], m[2]), persons, gedx);
      if(parent){
        addParentChild(gedx, parent, primary);
      }
    }
    // Link the two parents as a couple
    var ids = [], cm, re2 = /<<(\d+)\|/g;
    while((cm = re2.exec(chunk))){ ids.push(cm[1]); }
    if(ids.length === 2 && persons[ids[0]] && persons[ids[1]]){
      addCouple(gedx, persons[ids[0]], persons[ids[1]]);
    }
    return;
  }

  // Marriage: "He married, firstly, <<>>, daughter of <<>> and <<>>, in March 1819"
  var marriageMatch = !(isFirst || /^(?:He|She) /.test(sentence)) ? null : sentence.match(/\bmarried(?:,? (?:firstly|secondly|thirdly|fourthly|fifthly|sixthly|seventhly),?)? <<(\d+)\|(.*?)>>(.*)$/);
  if(marriageMatch){
    var spouse = getRelative(makeLink(marriageMatch[1], marriageMatch[2]), persons, gedx);
    if(spouse){
      addCouple(gedx, primary, spouse);
      var rest = marriageMatch[3];
      // Drop the descriptive clause naming the spouse's parents
      var cleaned = rest.replace(/<<\d+\|.*?>>/g, '');
      var date = findDate(cleaned),
          place = findPlace(rest);
      var marriage = makeFact('http://gedcomx.org/Marriage', date, place);
      if(date || place){
        primary.addFact(marriage);
      }
    }
    return;
  }

  // Simple life events
  for(var i = 0; i < EVENTS.length; i++){
    var ev = EVENTS[i],
        evMatch = sentence.match(ev.regex);
    if(evMatch && /^(?:He|She|[A-ZÀ-Þ])/.test(sentence)){
      // Avoid matching text such as "died" inside other clauses of long titles
      var restText = evMatch[1],
          evDate = findDate(stripTokens(restText)),
          evPlace = findPlace(restText);
      if(evDate || evPlace){
        primary.addFact(makeFact(ev.type, evDate, evPlace));
        if(ev.key){
          facts[ev.key] = true;
        }
      } else if(ev.key){
        // Event with neither date nor place provides nothing
      }
      return;
    }
  }
}

/**
 * Build a pseudo link element that getRelative can read
 */
function makeLink(id, text){
  if(linkElements[id]){
    return linkElements[id];
  }
  var $a = document.createElement('a');
  $a.setAttribute('href', 'p0.htm#i' + id);
  $a.textContent = text;
  return $a;
}

/**
 * Text of the heading without footnote numbers or icons
 */
function getHeadingText($h2){
  var text = '';
  if($h2){
    for(var n = $h2.firstChild; n; n = n.nextSibling){
      if(n.nodeType === 3){
        text += n.nodeValue;
      } else if(n.nodeType === 1 && n.nodeName.toLowerCase() !== 'sup' && n.nodeName.toLowerCase() !== 'img'){
        text += n.textContent;
      }
    }
  }
  return text.replace(/\s+/g, ' ').trim();
}
