var debug = require('debug')('genscrape:scrapers:geneanet'),
    utils = require('../utils'),
    GedcomX = require('gedcomx-js');

// Geneanet trees (GeneWeb) person pages. A person page has both the owner's
// tree (path) and the person's name (`n`) and first name (`p`) in the query.
var urls = [
  /^https?:\/\/gw\.geneanet\.org\/[^\/?#]+\?(?=[^#]*[?&]n=)(?=[^#]*[?&]p=)(?![^#]*[?&]m=)/
];

// Event verbs found in the top list. English and French are supported.
var eventTypes = [
  [/^(Born|N[ée]e?)\b\s*/i, 'http://gedcomx.org/Birth'],
  [/^(Baptized|Baptis[ée]e?)\b\s*/i, 'http://gedcomx.org/Baptism'],
  [/^(Deceased|D[ée]c[ée]d[ée]e?)\b\s*/i, 'http://gedcomx.org/Death'],
  [/^(Buried|Inhum[ée]e?)\b\s*/i, 'http://gedcomx.org/Burial'],
  [/^(Cremated|Incin[ée]r[ée]e?)\b\s*/i, 'http://gedcomx.org/Cremation']
];

module.exports = function(register){
  register(urls, run);
};

function run(emitter){
  debug('run');

  var $perso = document.getElementById('perso'),
      $h1 = $perso && $perso.querySelector('h1.name'),
      info = parseLink(document.location.href);

  if(!$perso || !$h1 || !info){
    return emitter.emit('noData');
  }

  var gedx = new GedcomX(),
      person = GedcomX.Person({
        id: info.id,
        principal: true,
        identifiers: {
          'genscrape': getRecordIdentifier(info.id)
        }
      }),
      relatives = {};

  gedx.addPerson(person);

  // Name
  var given = '', surname = '';
  toArray($h1.querySelectorAll('a')).forEach(function(a){
    var href = a.getAttribute('href') || '', text = clean(a.textContent);
    if(/[?&]m=P(&|$)/.test(href)){
      given = text;
    } else if(/[?&]m=N(&|$)/.test(href)){
      surname = text;
    }
  });
  if(given || surname){
    person.addNameFromParts({
      'http://gedcomx.org/Given': given,
      'http://gedcomx.org/Surname': surname
    });
  }

  // Gender
  var $sex = $h1.querySelector('img');
  if($sex){
    var src = $sex.getAttribute('src') || '';
    if(/female/.test(src)){
      person.setGender({type: 'http://gedcomx.org/Female'});
    } else if(/male/.test(src)){
      person.setGender({type: 'http://gedcomx.org/Male'});
    }
  }

  // Events (Born, Deceased, etc)
  var $titleBlock = document.getElementById('person-title'),
      $events = $titleBlock && nextElement($titleBlock.parentNode.parentNode, 'ul')
        || $perso.querySelector('ul');
  if($events){
    toArray($events.children).forEach(function(li){
      var fact = parseEvent(clean(li.textContent));
      if(fact){
        person.addFact(fact);
      }
    });
  }

  // Parents, spouses, and children
  toArray($perso.querySelectorAll('h2')).forEach(function(h2){
    var heading = clean(h2.textContent),
        $ul = nextElement(h2, 'ul');
    if(!$ul){
      return;
    }

    if(/^Parents$/i.test(heading)){
      toArray($ul.children).forEach(function(li){
        var parent = getRelative(gedx, relatives, directLink(li));
        if(parent){
          addRelationship(gedx, 'http://gedcomx.org/ParentChild', parent, person);
        }
      });
    }

    else if(/^(Spouses?|Conjoints?|Mariages?|Unions?|Marriages?)\b/i.test(heading)){
      toArray($ul.children).forEach(function(li){
        var spouse = getRelative(gedx, relatives, directLink(li));
        if(!spouse){
          return;
        }

        var rel = addRelationship(gedx, 'http://gedcomx.org/Couple', person, spouse),
            marriage = parseMarriage(li);
        if(marriage){
          rel.addFact(marriage);
          person.addFact(parseMarriage(li));
        }

        var $children = li.querySelector('ul');
        if($children){
          toArray($children.children).forEach(function(childLi){
            var child = getRelative(gedx, relatives, directLink(childLi));
            if(child){
              addRelationship(gedx, 'http://gedcomx.org/ParentChild', person, child);
              addRelationship(gedx, 'http://gedcomx.org/ParentChild', spouse, child);
            }
          });
        }
      });
    }
  });

  // Agent
  gedx.addAgent(GedcomX.Agent()
    .setId('agent')
    .addName({
      lang: 'en',
      value: 'Geneanet'
    })
    .setHomepage({
      resource: 'https://www.geneanet.org'
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
 * Find the next sibling element with the given tag name
 */
function nextElement($el, tag){
  var el = $el.nextElementSibling;
  while(el){
    if(el.tagName.toLowerCase() === tag){
      return el;
    }
    // Don't skip past the next section heading
    if(el.tagName === 'H2'){
      return;
    }
    el = el.nextElementSibling;
  }
}

/**
 * Get the first link that is a direct child of the list item
 * (not in a nested list of children)
 */
function directLink(li){
  var children = toArray(li.children);
  for(var i = 0; i < children.length; i++){
    if(children[i].tagName === 'A'){
      return children[i];
    }
  }
}

/**
 * Parse a Geneanet tree link into its parts
 *
 * @param {String} href
 * @returns {Object} `id`, `n`, `p`, `oc`
 */
function parseLink(href){
  if(!href){
    return;
  }

  var parts = href.replace(/#.*$/, '').split('?'),
      user = parts[0].split('/').pop(),
      query = {};

  (parts[1] || '').split('&').forEach(function(pair){
    var kv = pair.split('=');
    try {
      query[kv[0]] = decodeURIComponent((kv[1] || '').replace(/\+/g, ' '));
    } catch(e) {
      query[kv[0]] = kv[1];
    }
  });

  if(!user || !query.n || !query.p){
    return;
  }

  var id = [user, query.n, query.p];
  if(query.oc && query.oc !== '0'){
    id.push(query.oc);
  }

  return {
    id: id.join('.').replace(/\s+/g, '_'),
    n: query.n,
    p: query.p,
    oc: query.oc
  };
}

/**
 * Remove the weekday, age, and leading prepositions from a date
 */
function cleanDate(date){
  return clean(date)
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/^(on|in|le|en|vers)\s+/i, '')
    .trim();
}

/**
 * Parse text such as `Born February 22, 1732 (Friday) - Place` or
 * `Deceased December 14, 1799 (Saturday) - Place, aged 67 years old`
 */
function parseEvent(text){
  for(var i = 0; i < eventTypes.length; i++){
    if(eventTypes[i][0].test(text)){
      var rest = text.replace(eventTypes[i][0], ''),
          dash = rest.indexOf(' - '),
          date = dash === -1 ? rest : rest.slice(0, dash),
          place = dash === -1 ? '' : rest.slice(dash + 3);

      // Age at death
      place = place.replace(/,?\s*(aged|âgée?)\s.*$/i, '');
      if(dash === -1) {
        date = date.replace(/,?\s*(aged|âgée?)\s.*$/i, '');
      }

      date = cleanDate(date);
      place = clean(place);

      if(!date && !place){
        return;
      }

      var fact = GedcomX.Fact({type: eventTypes[i][1]});
      if(date){
        fact.setDate({original: date});
      }
      if(place){
        fact.setPlace({original: place});
      }
      return fact;
    }
  }
}

/**
 * Parse the marriage information from a spouse list item:
 * `Married in 1759 - Place to <spouse>`
 */
function parseMarriage(li){
  var text = '', node = li.firstChild;
  while(node && node !== directLink(li)){
    text += node.textContent;
    node = node.nextSibling;
  }

  text = clean(text);
  var match = text.match(/^(Married|Mari[ée]e?)\s*(.*?)\s*(?:to|à|avec)?$/i);
  if(!match){
    return;
  }

  var rest = match[2].replace(/\s+(to|à|avec)$/i, ''),
      dash = rest.indexOf(' - '),
      date = cleanDate(dash === -1 ? rest : rest.slice(0, dash)),
      place = dash === -1 ? '' : clean(rest.slice(dash + 3));

  var fact = GedcomX.Fact({type: 'http://gedcomx.org/Marriage'});
  if(date){
    fact.setDate({original: date});
  }
  if(place){
    fact.setPlace({original: place});
  }
  return fact;
}

/**
 * Get (or create) the relative that a link points to
 */
function getRelative(gedx, relatives, $link){
  if(!$link){
    return;
  }

  var info = parseLink($link.getAttribute('href'));
  if(!info){
    return;
  }
  if(relatives[info.id]){
    return relatives[info.id];
  }

  var relative = GedcomX.Person({
    id: info.id,
    identifiers: {
      'genscrape': getRecordIdentifier(info.id)
    }
  });

  relative.addSimpleName(clean($link.textContent));

  // Lifespan: `1701-1756`, `ca 1694-1743`, `1716`, `1690-`
  var $bdo = $link.nextElementSibling;
  while($bdo && $bdo.tagName !== 'BDO'){
    if($bdo.tagName === 'A'){
      $bdo = null;
      break;
    }
    $bdo = $bdo.nextElementSibling;
  }
  if($bdo){
    var life = clean($bdo.textContent).split('-'),
        born = clean(life[0]),
        died = clean(life[1]);
    if(born){
      relative.addFact(GedcomX.Fact({
        type: 'http://gedcomx.org/Birth',
        date: {original: born}
      }));
    }
    if(died){
      relative.addFact(GedcomX.Fact({
        type: 'http://gedcomx.org/Death',
        date: {original: died}
      }));
    }
  }

  gedx.addPerson(relative);
  relatives[info.id] = relative;
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

function getRecordIdentifier(id){
  return 'genscrape://geneanet/' + id;
}
