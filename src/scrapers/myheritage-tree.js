var debug = require('debug')('genscrape:scrapers:myheritage-tree'),
    utils = require('../utils'),
    GedcomX = require('gedcomx-js');

var endpoint = '/FP/API/FamilyTree/get-extended-card-content.php';

var factTypes = {
  BIRT: 'http://gedcomx.org/Birth',
  CHR: 'http://gedcomx.org/Christening',
  CHRA: 'http://gedcomx.org/Christening',
  BAPM: 'http://gedcomx.org/Baptism',
  MARR: 'http://gedcomx.org/Marriage',
  DEAT: 'http://gedcomx.org/Death',
  BURI: 'http://gedcomx.org/Burial',
  RESI: 'http://gedcomx.org/Residence',
  OCCU: 'http://gedcomx.org/Occupation',
  CENS: 'http://gedcomx.org/Census',
  IMMI: 'http://gedcomx.org/Immigration',
  EMIG: 'http://gedcomx.org/Emigration'
};

module.exports = function(register) {
  register([
    utils.urlPatternToRegex('https://www.myheritage.com/family-trees/*')
  ], run);
};

function run(emitter) {
  var pathMatch = window.location.pathname.match(/\/family-trees\/[^/]+\/([^/]+)/),
      params = utils.getQueryParams(window.location.href),
      treeToken = pathMatch && pathMatch[1],
      personId = params.rootIndividualID;

  if (!treeToken || !personId) {
    emitter.emit('noData');
    return;
  }

  // The URL's rootIndividualID identifies the initially requested profile.
  // Subsequent selections are detected from the profile requests made by the page.
  getProfile(treeToken, personId, emitter, function() {
    observeProfileRequests(treeToken, emitter);
  });
}

function getProfile(treeToken, personId, emitter, callback) {
  var today = new Date(),
      clientDate = today.getFullYear() + '-' + pad(today.getMonth() + 1) + '-' + pad(today.getDate()),
      url = endpoint + '?allEventsForIndividual=1'
        + '&clientDate=' + clientDate
        + '&dataLang=EN&discoveries=1&dna=1&facts=1'
        + '&individualID=' + encodeURIComponent(personId)
        + '&lang=EN&matches=0&path=&photos=1&relatives=1'
        + '&s=' + encodeURIComponent(treeToken) + '&sites=0';

  debug('request profile', personId);
  utils.getJSON(url, function(error, data) {
    if (error) {
      emitter.emit('error', error);
      return;
    }
    if (!data || data.success !== true) {
      emitter.emit('noData');
      return;
    }
    try {
      emitter.emit('data', processData(treeToken, personId, data));
      if (callback) callback();
    } catch (e) {
      emitter.emit('error', e);
    }
  });
}

// Observe later profile-card requests. The modern tree keeps the page URL
// unchanged when a different person is selected; the individualID is in this
// request, not in the URL/hash.
function observeProfileRequests(treeToken, emitter) {
  var XHR = window.XMLHttpRequest;
  if (!XHR || !XHR.prototype || XHR.prototype.__genscrapeMyHeritageObserver) return;

  var prototype = XHR.prototype,
      originalOpen = prototype.open,
      originalSend = prototype.send;

  prototype.open = function(method, url) {
    this.__genscrapeMyHeritageUrl = url;
    return originalOpen.apply(this, arguments);
  };

  prototype.send = function() {
    var request = this,
        requestUrl = request.__genscrapeMyHeritageUrl || '';

    if (requestUrl.indexOf(endpoint) !== -1) {
      request.addEventListener('load', function() {
        var response;
        try {
          response = typeof request.response === 'object' && request.response !== null
            ? request.response : JSON.parse(request.responseText);
          if (response && response.success === true) {
            var match = requestUrl.match(/[?&]individualID=([^&]+)/),
                personId = match && decodeURIComponent(match[1]);
            if (personId) emitter.emit('data', processData(treeToken, personId, response));
          }
        } catch (e) {
          debug('could not process observed profile response', e);
        }
      });
    }
    return originalSend.apply(this, arguments);
  };

  prototype.__genscrapeMyHeritageObserver = true;

  // Some builds of the new tree UI use fetch rather than XMLHttpRequest.
  // Clone matching responses so the page can still consume its original body.
  if (typeof window.fetch === 'function' && !window.__genscrapeMyHeritageFetchObserver) {
    var originalFetch = window.fetch;
    window.fetch = function(input) {
      var requestUrl = typeof input === 'string' ? input : (input && input.url) || '';
      return originalFetch.apply(this, arguments).then(function(response) {
        if (requestUrl.indexOf(endpoint) !== -1) {
          response.clone().json().then(function(data) {
            var match = requestUrl.match(/[?&]individualID=([^&]+)/),
                personId = match && decodeURIComponent(match[1]);
            if (data && data.success === true && personId) {
              try {
                emitter.emit('data', processData(treeToken, personId, data));
              } catch (e) {
                debug('could not process observed fetch response', e);
              }
            }
          }).catch(function(e) {
            debug('could not read observed fetch response', e);
          });
        }
        return response;
      });
    };
    window.__genscrapeMyHeritageFetchObserver = true;
  }
}

function processData(treeToken, personId, data) {
  var gedx = new GedcomX(),
      primaryId = String(personId),
      primary = makePerson(data, primaryId, treeToken, true),
      people = {},
      relationshipKeys = {};

  people[primaryId] = primary;
  gedx.addPerson(primary);

  (data.relatives || []).forEach(function(relative) {
    var id = String(relative.id);
    if (!people[id]) {
      people[id] = makeRelative(relative, treeToken);
      gedx.addPerson(people[id]);
    }
  });

  function addRelationship(type, person1, person2) {
    if (!person1 || !person2) return;
    var key = type + ':' + person1.getId() + ':' + person2.getId();
    if (relationshipKeys[key]) return;
    relationshipKeys[key] = true;
    gedx.addRelationship({ type: type, person1: person1, person2: person2 });
  }

  var coupleType = 'http://gedcomx.org/Couple',
      parentChildType = 'http://gedcomx.org/ParentChild';

  // Family groups include the selected person implicitly. In a spouse group,
  // spouseIds are the selected person's partners; in a parents group they are
  // the selected person's parents.
  (data.relativeFamilies || []).forEach(function(family) {
    var spouseIds = family.spouseIds || [],
        childIds = family.childrenIds || [];

    if (family.type === 'spouse') {
      spouseIds.forEach(function(spouseId) {
        var spouse = people[String(spouseId)];
        addRelationship(coupleType, primary, spouse);
        childIds.forEach(function(childId) {
          var child = people[String(childId)];
          addRelationship(parentChildType, primary, child);
          addRelationship(parentChildType, spouse, child);
        });
      });
    } else if (family.type === 'parents') {
      if (spouseIds.length >= 2) {
        addRelationship(coupleType, people[String(spouseIds[0])], people[String(spouseIds[1])]);
      }
      spouseIds.forEach(function(parentId) {
        addRelationship(parentChildType, people[String(parentId)], primary);
      });
    }
  });

  // The relatives list also carries explicit relationship labels. Use it as a
  // fallback for any relationships not represented in relativeFamilies.
  (data.relatives || []).forEach(function(relative) {
    var relation = (relative.relation || '').toLowerCase(),
        person = people[String(relative.id)];
    if (/wife|husband|spouse/.test(relation)) {
      addRelationship(coupleType, primary, person);
    } else if (/father|mother|parent/.test(relation)) {
      addRelationship(parentChildType, person, primary);
    } else if (/son|daughter|child/.test(relation)) {
      addRelationship(parentChildType, primary, person);
    }
  });

  // The endpoint returns events for the selected person and, in some cases,
  // events belonging to relatives. Only attach the selected person's facts.
  (data.facts || []).forEach(function(sourceFact) {
    if (String(sourceFact.individualId) !== primaryId) return;
    var type = factTypes[sourceFact.type],
        fact;
    if (!type) return;
    fact = GedcomX.Fact({ type: type, value: sourceFact.content || undefined });
    if (sourceFact.date || sourceFact.year) {
      fact.setDate({ original: sourceFact.date || String(sourceFact.year) });
    }
    var place = extractPlace(sourceFact.place);
    if (place) fact.setPlace({ original: place });
    primary.addFact(fact);
  });

  var agent = GedcomX.Agent()
    .setId('agent')
    .addName({ lang: 'en', value: 'MyHeritage' })
    .setHomepage({ resource: 'https://www.myheritage.com' });
  gedx.addAgent(agent);

  var fullName = data.name || [data.firstName, data.lastName].filter(Boolean).join(' '),
      source = GedcomX.SourceDescription()
        .setAbout(window.document.location.href)
        .addTitle({ value: fullName + ' - MyHeritage Tree' })
        .addCitation({
          value: 'MyHeritage Family Trees (https://www.myheritage.com : accessed '
            + utils.getDateString() + '), Person #' + treeToken + ':' + primaryId
            + ' for ' + fullName + '.'
        })
        .setRepository({ resource: '#agent' });
  gedx.addSourceDescriptionToAll(source);

  return gedx;
}


function makePerson(data, id, treeToken, principal) {
  var person = new GedcomX.Person({
    id: String(id),
    principal: !!principal,
    identifiers: {
      genscrape: 'genscrape://myheritage:tree/person:' + treeToken + ':' + id
    }
  });
  addParsedNames(person, data.name || [data.firstName, data.lastName].filter(Boolean).join(' '));
  setGender(person, data.gender);
  return person;
}

function makeRelative(relative, treeToken) {
  var person = new GedcomX.Person({
    id: String(relative.id),
    identifiers: {
      genscrape: 'genscrape://myheritage:tree/person:' + treeToken + ':' + relative.id
    }
  });
  addParsedNames(person, relative.name);
  setGender(person, relative.gender);
  return person;
}

function addParsedNames(person, fullName) {
  if (!fullName) return;

  var match = fullName.match(/^(.*?)\s+\(born\s+(.+?)\)$/i);

  if (match) {
    var currentName = match[1].trim();
    var birthSurname = match[2].trim();
    var currentParts = splitName(currentName);

    addNameForm(person, currentName, currentParts.given, currentParts.surname);
    addNameForm(person, currentParts.given + ' ' + birthSurname, currentParts.given, birthSurname);
  } else {
    var parts = splitName(fullName);
    addNameForm(person, fullName, parts.given, parts.surname);
  }
}

function splitName(name) {
  var parts = name.trim().split(/\s+/);

  if (parts.length < 2) {
    return { given: name.trim(), surname: undefined };
  }

  return {
    given: parts.slice(0, -1).join(' '),
    surname: parts[parts.length - 1]
  };
}

function addNameForm(person, fullText, given, surname) {
  var form = GedcomX.NameForm().setFullText(fullText);

  if (given) {
    form.addPart(
      GedcomX.NamePart()
        .setType('http://gedcomx.org/Given')
        .setValue(given)
    );
  }

  if (surname) {
    form.addPart(
      GedcomX.NamePart()
        .setType('http://gedcomx.org/Surname')
        .setValue(surname)
    );
  }

  person.addName(
    GedcomX.Name().addNameForm(form)
  );
}


function setGender(person, gender) {
  if (gender === 'M') person.setGender({ type: 'http://gedcomx.org/Male' });
  if (gender === 'F') person.setGender({ type: 'http://gedcomx.org/Female' });
}

function extractPlace(raw) {
  if (!raw) return null;
  var div = window.document.createElement('div');
  div.innerHTML = raw;
  var anchors = div.querySelectorAll('a');
  for (var i = anchors.length - 1; i >= 0; i--) {
    var value = anchors[i].textContent.trim();
    if (value) return value;
  }
  var scripts = div.querySelectorAll('script, style');
  for (var j = 0; j < scripts.length; j++) scripts[j].parentNode.removeChild(scripts[j]);
  return div.textContent.replace(/\s+/g, ' ').trim() || null;
}

function pad(value) {
  return value < 10 ? '0' + value : String(value);
}
