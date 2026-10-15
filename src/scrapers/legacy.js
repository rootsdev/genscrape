var debug = require('debug')('genscrape:scrapers:legacy'),
    utils = require('../utils'),
    GedcomX = require('gedcomx-js');

// Obituary pages: /us/obituaries/<paper>/name/<slug>-obituary?id=<id>
var urls = [
  /^https?:\/\/(?:www\.)?legacy\.com\/(?:[a-z]{2}\/)?obituaries\/(?:[\w-]+\/)?name\/[^?#]*-obituary\?(?:[^#]*&)?id=\d+/
];

var monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

module.exports = function(register){
  register(urls, run);
};

function run(emitter){

  debug('run');

  var data = getJsonLd(),
      $person = data.Person,
      article = data.NewsArticle;

  if(!$person || !($person.name || $person.givenName || $person.familyName)){
    return emitter.emit('noData');
  }

  var id = getRecordId(),
      gedx = new GedcomX(),
      person = GedcomX.Person({
        principal: true,
        id: id,
        identifiers: {
          'genscrape': 'genscrape://legacy/' + id
        }
      });

  // Name. Legacy splits the name into given, additional (middle) and family.
  var given = [$person.givenName, $person.additionalName].filter(Boolean).join(' '),
      surname = $person.familyName,
      fullName = ($person.name || [given, surname].filter(Boolean).join(' ')).replace(/\s+/g, ' ').trim();
  if(given || surname){
    person.addNameFromParts({
      'http://gedcomx.org/Given': given,
      'http://gedcomx.org/Surname': surname
    });
    person.getNames()[0].getNameForms()[0].setFullText(fullName);
  } else {
    person.addSimpleName(fullName);
  }

  // Facts. When there are no full dates, fall back to the years in the
  // headline: "Name Obituary (1936 - 2026) - City, ST - Paper"
  var years = /\((\d{4}) - (\d{4})\)/.exec((article && article.headline) || document.title || ''),
      birthDate = $person.birthDate ? formatDate($person.birthDate) : (years ? years[1] : undefined),
      deathDate = $person.deathDate ? formatDate($person.deathDate) : (years ? years[2] : undefined);
  if(birthDate){
    person.addFact({
      type: 'http://gedcomx.org/Birth',
      date: {
        original: birthDate
      }
    });
  }

  var deathPlace = formatPlace($person.deathPlace);
  if(deathDate || deathPlace){
    var death = GedcomX.Fact({type: 'http://gedcomx.org/Death'});
    if(deathDate){
      death.setDate({original: deathDate});
    }
    if(deathPlace){
      death.setPlace({original: deathPlace});
    }
    person.addFact(death);
  }

  gedx.addPerson(person);

  // Agent
  gedx.addAgent(GedcomX.Agent()
    .setId('agent')
    .addName({
      lang: 'en',
      value: 'Legacy.com'
    })
    .setHomepage({
      resource: 'https://www.legacy.com'
    }));

  // SourceDescription
  var title = (article && article.headline) || document.title || (fullName + ' Obituary'),
      published = article && article.datePublished ? ' published ' + formatDate(article.datePublished) : '';
  gedx.addSourceDescriptionToAll({
    about: document.location.href,
    titles: [
      {
        value: title
      }
    ],
    citations: [
      {
        value: '"' + title + '," obituary' + published + ', Legacy.com (' + document.location.href
          + ' : accessed ' + utils.getDateString() + ').'
      }
    ],
    repository: {
      resource: '#agent'
    }
  });

  emitter.emit('data', gedx);
}

/**
 * Parse all JSON-LD blocks and return the first of each type
 *
 * @returns {Object} Map of @type => object
 */
function getJsonLd(){
  var result = {};
  Array.from(document.querySelectorAll('script[type="application/ld+json"]')).forEach(function(script){
    try {
      var json = JSON.parse(script.textContent);
      if(json && json['@type'] && !result[json['@type']]){
        result[json['@type']] = json;
      }
    } catch(e) {
      debug('invalid json-ld');
    }
  });
  return result;
}

/**
 * Convert 2026-8-27 or 2026-08-31T00:00:00.000Z into 27 August 2026
 *
 * @param {String} value
 * @returns {String}
 */
function formatDate(value){
  var match = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(value || '');
  if(match && monthNames[parseInt(match[2], 10) - 1]){
    return parseInt(match[3], 10) + ' ' + monthNames[parseInt(match[2], 10) - 1] + ' ' + match[1];
  }
  return value;
}

/**
 * Convert a schema.org Place with a PostalAddress into a string
 *
 * @param {Object} place
 * @returns {String}
 */
function formatPlace(place){
  var address = place && place.address;
  if(!address){
    return;
  }
  return [address.addressLocality, address.addressRegion, address.addressCountry].filter(Boolean).join(', ') || undefined;
}

function getRecordId(){
  var match = /[?&]id=(\d+)/.exec(document.location.search || document.location.href);
  return match ? match[1] : '';
}
