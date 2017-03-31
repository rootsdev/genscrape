var debug = require('debug')('genscrape:scrapers:ancestry-person'),
    utils = require('../utils'),
    GedcomX = require('gedcomx-js');

var urls = [
  utils.urlPatternToRegex('https://www.myheritage.com/person-*')
];

var eventMappings = [
  {
    regex: /^birth$/,
    type: 'http://gedcomx.org/Birth'
  },
  {
    regex: /^christening$/,
    type: 'http://gedcomx.org/Christening'
  },
  {
    regex: /^marriage to/,
    type: 'http://gedcomx.org/Marriage'
  },
  {
    regex: /^immigration$/,
    type: 'http://gedcomx.org/Immigration'
  },
  {
    regex: /^residence$/,
    type: 'http://gedcomx.org/Residence'
  },
  {
    regex: /^death$/,
    type: 'http://gedcomx.org/Death'
  },
  {
    regex: /^burial$/,
    type: 'http://gedcomx.org/Burial'
  }
];

module.exports = function(register){
  register([
    utils.urlPatternToRegex('https://www.myheritage.com/person-*')
  ], runPerson);
  register([
    utils.urlPatternToRegex('https://www.myheritage.com/site-family-tree-*')
  ], runSite);
};

function runPerson(emitter) {
  debug('run person');
  var matches = window.location.pathname.match(/\/person-([0-9]+)_([0-9]+)_([0-9]+)\//);
  var personId = matches[1];
  var treeId = matches[2];
  run(emitter, treeId, personId);
}

function runSite(emitter) {
  debug('run site');
  var treeMatches = window.location.pathname.match(/\/site-family-tree-([0-9]+)\//);
  var treeId = treeMatches[1];
  var personMatches = window.location.hash.match(/profile-([0-9]+)-info/);
  var personId = personMatches[1];
  run(emitter, treeId, personId);
}

function run(emitter, treeId, personId) {

  debug('run');

  var pageUrl = `/FP/API/Profile/get-profile-tab-content.php?s=${treeId}&siteID=${treeId}&indID=${personId}&show=info&inCanvas=1&getPart=main`;
  var eventUrl = `/FP/API/Profile/get-profile-tab-content.php?s=${treeId}&siteID=${treeId}&indID=${personId}&show=events&inCanvas=0&getPart=tab`;

  debug(`page url: ${pageUrl}`);
  debug(`event url: ${eventUrl}`);

  // Get page html
  utils.getHTML(pageUrl, function(error, pageHtml){
    debug('pageUrl response');

    // HTTP error
    if(error){
      debug('error');
      emitter.emit('error', error);
    } else {
      utils.getHTML(eventUrl, function(error, eventHtml){
        if(error){
          debug('error');
          emitter.emit('error', error);
        } else {
          process(emitter, treeId, personId, parseHTML(pageHtml), parseHTML(eventHtml));
        }
      });
    }
  });
}


/**
 * Traverse DOM to extract person data
 */
function process(emitter, treeId, personId, $page, $event) {
  debug('processing');

  var gedx = new GedcomX();
  var primaryPerson = new GedcomX.Person({
    id: treeId + ':' + personId,
    principal: true,
    identifiers: {
      'genscrape': 'genscrape://myheritage:tree/person:' + treeId + ':' + personId
    }
  });

  var name = $page.querySelector('#BreadcrumbsFinalText').textContent;
  primaryPerson.addSimpleName(name);

  gedx.addPerson(primaryPerson);

  // Get events
  var events = $event.querySelectorAll('.EventRow');

  for (var i = 0; i < events.length; i++) {
    var event = events[i].querySelector('.EventsText');
    var parts = event.querySelectorAll('.FL_Label');
    var type = parts[0];
    var place = null;
    var date = null;
    if (parts.length == 2) {
      place = parts[1].textContent;
    }
    if (parts.length == 3) {
      place = parts[1].textContent;
      date = parts[2].textContent;
    }

    // Handle basic event types
    eventMappings.forEach(function(mapping) {
      if (type.textContent.toLowerCase().match(mapping.regex)) {
        var fact = GedcomX.Fact({
          type: mapping.type
        });
        if (date) {
          fact.setDate({
            original: date.trim()
          });
        }
        if (place) {
          fact.setPlace({
            original: place.trim()
          });
        }
        primaryPerson.addFact(fact);
      }
    });

    // Handle Marriage
    if (type.textContent.toLowerCase().match(/^marriage to/)) {
      var aTag = type.querySelector('a');
      var person = new GedcomX.Person({
        id: getRecordId(aTag.href),
        identifiers: {
          'genscrape': getRecordIdentifier(aTag.href)
        }
      });
      person.addSimpleName(aTag.textContent.trim());
      gedx.addPerson(person);
      gedx.addRelationship({
        type: 'http://gedcomx.org/Couple',
        person1: primaryPerson,
        person2: person
      });
    }

    // Handle Daughter
    if (type.textContent.toLowerCase().match(/^birth of daughter/)) {
      var aTag = type.querySelector('a');
      var person = new GedcomX.Person({
        id: getRecordId(aTag.href),
        identifiers: {
          'genscrape': getRecordIdentifier(aTag.href)
        }
      });
      person.addSimpleName(aTag.textContent.trim());
      person.setGender({
        type: 'http://gedcomx.org/Female'
      });
      gedx.addPerson(person);
      gedx.addRelationship({
        type: 'http://gedcomx.org/ParentChild',
        person1: primaryPerson,
        person2: person
      });
    }

    // Handle Son
    if (type.textContent.toLowerCase().match(/^birth of son/)) {
      var aTag = type.querySelector('a');
      var person = new GedcomX.Person({
        id: getRecordId(aTag.href),
        identifiers: {
          'genscrape': getRecordIdentifier(aTag.href)
        }
      });
      person.addSimpleName(aTag.textContent.trim());
      person.setGender({
        type: 'http://gedcomx.org/Male'
      });
      gedx.addPerson(person);
      gedx.addRelationship({
        type: 'http://gedcomx.org/ParentChild',
        person1: primaryPerson,
        person2: person
      });
    }

  }

  // Get immediate family section
  // There is no identifiers for this table, so get the first table under the h2
  var h2s = $page.querySelectorAll('h2');
  for (var i = 0; i < h2s.length; i++) {
    if (h2s[i].textContent.toLowerCase().trim() === 'immediate family') {
      var table = h2s[i].nextSibling;
      var tds = table.querySelectorAll('td');
      for (var j = 0; j < tds.length; j++) {
        var td = tds[j];
        // Skip empty tds
        if (td.textContent.trim() === '') continue;
        var aTag = td.querySelector('a');
        var rel = td.querySelector('span').textContent.trim();

        // Mother
        if (rel.toLowerCase() == 'his mother') {
          var person = new GedcomX.Person({
            id: getRecordId(aTag.href),
            identifiers: {
              'genscrape': getRecordIdentifier(aTag.href)
            }
          });
          person.addSimpleName(aTag.textContent.trim());
          person.setGender({
            type: 'http://gedcomx.org/Female'
          });
          gedx.addPerson(person);
          gedx.addRelationship({
            type: 'http://gedcomx.org/ParentChild',
            person1: person,
            person2: primaryPerson
          });
        }

        // Father
        if (rel.toLowerCase() == 'his father') {
          var person = new GedcomX.Person({
            id: getRecordId(aTag.href),
            identifiers: {
              'genscrape': getRecordIdentifier(aTag.href)
            }
          });
          person.addSimpleName(aTag.textContent.trim());
          person.setGender({
            type: 'http://gedcomx.org/Male'
          });
          gedx.addPerson(person);
          gedx.addRelationship({
            type: 'http://gedcomx.org/ParentChild',
            person1: person,
            person2: primaryPerson
          });
        }
      }
    }
  }


  emitter.emit('data', gedx);
}



function parseHTML(html){
  var div = window.document.createElement('div');
  div.innerHTML = html;
  return div;
}

function getRecordId(url) {
  var matches = url.match(/\/person-([0-9]+)_([0-9]+)_([0-9]+)\//);
  return matches[2] + ':' + matches[1];
}

function getRecordIdentifier(url) {
  return 'genscrape://myheritage:tree/person:' + getRecordId(url);
}
