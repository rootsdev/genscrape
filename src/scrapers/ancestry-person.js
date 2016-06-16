var debug = require('debug')('ancestry-person'),
    utils = require('../utils'),
    GedcomX = require('gedcomx-js');

var urls = [
  utils.urlPatternToRegex('http://person.ancestry.com/tree/*/person/*'),
  utils.urlPatternToRegex('http://person.ancestryinstitution.com/tree/*/person/*')
];

var eventConfig = [
  {
    label: 'birth',
    type: 'http://gedcomx.org/Birth'
  },
  {
    label: 'christening',
    type: 'http://gedcomx.org/Christening'
  },
  {
    label: 'death',
    type: 'http://gedcomx.org/Death'
  },
  {
    label: 'arrival',
    type: 'http://gedcomx.org/Immigration'
  },
  {
    label: 'departure',
    type: 'http://gedcomx.org/Emigration'
  },
  {
    label: 'residence',
    type: 'http://gedcomx.org/Residence'
  }
];

module.exports = function(register){
  register(urls, run);
};

/**
 * Called when the URL matches.
 * Retrieve HTML for facts tab and process.
 * We do this even if we're already on the facts tab
 * because it's easier to just always request is as
 * opposed to detecting which tab we start on.
 */
function run(emitter) {
  
  debug('run');
  
  // We start on a url such as http://person.ancestry.com/tree/70025770/person/30322313653/facts.
  // We want to strip anything after the second number and replace it with /content/factsbody
  var factsUrl = window.location.pathname.split('/').slice(0,5).join('/') + '/content/factsbody';
  
  debug('url: ' + factsUrl);
  
  // Get facts html
  utils.getJSON(factsUrl, function(error, json){
    debug('response');
    
    // HTTP error
    if(error){
      debug('error');
      emitter.emit('error', error);
    } 
    
    else {
      
      // Error returned by the ancestry api
      if(json.HasError){
        debug(json.ErrorMessage);
        debug(json.FailurePoint);
        emitter.emit('error', json.ErrorMessage);
        return;
      }
      
      if(!json.html.body){
        debug('no html');
        emitter.emit('noData');
        return;
      }
  
      process(emitter, parseHTML(json.html.body));
    }
  });
}

/**
 * Traverse DOM to extract person data
 */
function process(emitter, $dom){
  debug('processing');
  
  var gedx = new GedcomX(),
      primaryPerson = new GedcomX.Person(),
      facts = FactsList($dom);
  
  gedx.addPerson(primaryPerson);
  
  // Gender
  if(facts.hasFact('gender')){
    switch(facts.getFirstText('gender')){
      case 'Female':
        primaryPerson.setGender({
          type: 'http://gedcomx.org/Female'
        });
        break;
      case 'Male':
        primaryPerson.setGender({
          type: 'http://gedcomx.org/Male'
        });
        break;
      case 'Unknown':
        primaryPerson.setGender({
          type: 'http://gedcomx.org/Unknown'
        });
        break;
    }
  }
  
  // Process the names
  facts.getCardTitles('name').forEach(function(nameText){
    primaryPerson.addSimpleName(nameText);
  });
  
  // Events
  eventConfig.forEach(function(config){
    if(facts.hasFact(config.label)){
      facts.getGedXFacts(config.label, config.type).forEach(function(fact){
        primaryPerson.addFact(fact);
      });
    }
  });
  
  // Relationships
  
  // Marriage events
  
  // Sources

  /*
  
  // Relationships
  
  var $lists = $dom.find('#familySection > .researchList'),
      $parents = $lists.first().find('.card'),
      $father = $parents.first(),
      $mother = $parents.eq(1);
  
  if(!$father.is('.cardEmpty')){
    var fatherNameParts = getNameParts($father);
    personData.fatherGivenName = fatherNameParts[0];
    personData.fatherFamilyName = fatherNameParts[1];
  }
  
  if(!$mother.is('.cardEmpty')){
    var motherNameParts = getNameParts($mother);
    personData.motherGivenName = motherNameParts[0];
    personData.motherFamilyName = motherNameParts[1];
  }
  
  var $spouse = $lists.eq(1).find('.card').first();
  if(!$spouse.is('.cardEmpty')){
    var spouseNameParts = getNameParts($spouse);
    personData.spouseGivenName = spouseNameParts[0];
    personData.spouseFamilyName = spouseNameParts[1];
  }
  
  // TODO: get marriage event that matches this spouse
  */
  
  emitter.emit('data', gedx);
}

/**
 * Get the name parts from a relative's card
 */
function getNameParts($card){
  return utils.splitName($card.find('.userCardTitle').text().trim());
}

/**
 * Split the event string on the • which separates the
 * date from the place. Also uncapitalize month abbreviation.
 */
function processEvent($event){
  return {
    date: utils.toTitleCase($event.find('.factItemDate').text().trim()),
    place: $event.find('.factItemLocation').text().trim()
  };
}

/**
 * Parse an HTML string into DOM objects. Returns the string wrapped in a parent div
 * 
 * @param {String} html
 * @returns {HTMLElement}
 */
function parseHTML(html){
  var div = window.document.createElement('div');
  div.innerHTML = html;
  return div;
}

/**
 * Process the list of facts. Enable quick extraction of data.
 * 
 * @param {HTMLElement} $dom - A DOM element that the facts list can be found inside of.
 * @param {Object} Contains helper methods for accessing the data. See the docs inline below.
 */
function FactsList($dom){
  
  // Gather list of events. Store in map keyed by event title.
  // Each value is a list of events because events can occur multiple times
  // and even events that should occur only once (birth) may be documented
  // multiple times if documents provide conflicting values.
  var facts = {};
  
  Array.from($dom.querySelectorAll('#factsSection .LifeEvent')).forEach(function(card){
    // The element where the event name is found may have other data in it.
    // The event name is a plain text node where as the other data is
    // wrapped in another element. So we traverse the childNodes and look for
    // the first regular text node.
    var name = firstChildText(card.querySelector('.cardSubtitle')).trim().toLowerCase();
    if(typeof facts[name] === 'undefined'){
      facts[name] = [];
    }
    facts[name].push(card);
  });
  
  return {
    
    /**
     * Get the DOM elements that represent the fact card for the given fact.
     * 
     * @param {String} factType
     * @returns {HTMLElement[]}
     */
    getCards: function(factType){
      return facts[factType] || [];
    },
    
    /**
     * Get the titles of fact cards.
     * 
     * @param {String} factType
     * @returns {String[]}
     */
    getCardTitles: function(factType){
      return this.getCards(factType).map(function(card){
        return card.querySelector('.cardTitle').textContent.trim();
      });
    },
    
    /**
     * Get text value of first matching card
     * 
     * @param {String} factType
     * @returns {String}
     */
    getFirstText: function(factType){
      var card = this.getFirstCard(factType);
      if(card){
        return card.querySelector('.cardTitle').textContent.trim();
      }
    },
    
    /**
     * Get first matching card
     * 
     * @param {String} factType
     * @returns {HTMLElement}
     */
    getFirstCard: function(factType){
      if(facts[factType]){
        return facts[factType][0];
      }
    },
    
    /**
     * Check whether we have data for a given fact
     * 
     * @param {String} factType
     * @returns {Boolean}
     */
    hasFact: function(factType){
      return typeof facts[factType] !== 'undefined';
    },
    
    /**
     * Get GEDCOM X facts of the given type
     * 
     * @param {String} factType
     * @param {String} gedxType
     * @param {GedcomX.Fact[]}
     */
    getGedXFacts: function(factType, gedxType){
      return this.getCards(factType).map(function(card){
        var $date = card.querySelector('.factItemDate'),
            date = $date ? utils.toTitleCase($date.textContent.trim()) : null,
            $place = card.querySelector('.factItemLocation'),
            place = $place ? $place.textContent.trim() : null,
            fact = GedcomX.Fact({
              type: gedxType
            });
        if(date){
          fact.setDate({
            original: date
          });
        }
        if(place){
          fact.setPlace({
            original: place
          });
        }
        return fact;
      });
    }
    
  };
  
}

/**
 * Return the first immediate child text node of an HTML element
 * 
 * @param {HTMLElement} $element
 * @returns {String}
 */
function firstChildText($element){
  for (var i = 0; i < $element.childNodes.length; i++) {
    var curNode = $element.childNodes[i];
    if (curNode.nodeName === "#text") {
      return curNode.nodeValue;
    }
  }
}