var debug = require('debug')('genscrape:scrapers:ancestry-person'),
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
      primaryPerson = new GedcomX.Person({
        id: getPersonIdFromUrl(window.location.href),
        principal: true,
        identifiers: {
          'http://gedcomx.org/Primary': window.location.href
        }
      }),
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
  
  //
  // Relationships
  // 
  
  var relLists = getRelLists($dom);
  
  // Parents
  relLists.parents.forEach(function($parentsList){
    var $parents = $parentsList.querySelectorAll('.card'),
        $father = $parents[0],
        $mother = $parents[1],
        father, mother;
    
    // Create parents and parent-child relationships
    
    if(!$father.classList.contains('cardEmpty')){
      father = getPersonFromCard(gedx, $father);
      gedx.addPerson(father);
      gedx.addRelationship({
        type: 'http://gedcomx.org/ParentChild',
        person1: father,
        person2: primaryPerson
      });
    }
    
    if(!$mother.classList.contains('cardEmpty')){
      mother = getPersonFromCard(gedx, $mother);
      gedx.addPerson(mother);
      gedx.addRelationship({
        type: 'http://gedcomx.org/ParentChild',
        person1: mother,
        person2: primaryPerson
      });
    }
    
    // Create couple relationship if both the father and mother exist
    if(father && mother){
      gedx.addRelationship({
        type: 'http://gedcomx.org/Couple',
        person1: father,
        person2: mother
      });
    }
    
  });
  
  // TODO: siblings and half siblings
  
  // Spouses and Children
  relLists.spouses.forEach(function($spouseList){
    var $children = Array.from($spouseList.querySelectorAll('.card')),
        $spouse = $children.shift(),
        spouse;
        
    if(!$spouse.classList.contains('cardEmpty')){
      spouse = getPersonFromCard(gedx, $spouse);
      gedx.addPerson(spouse);
      var relationship = GedcomX.Relationship({
        type: 'http://gedcomx.org/Couple',
        person1: primaryPerson,
        person2: spouse
      });
      gedx.addRelationship(relationship);
      
      // Try to find a marriage event from the facts list
      var spouseName = spouse.getNames()[0].getNameForms()[0].getFullText();
      facts.getCards('marriage').forEach(function($marriage){
        var $spouseName = $marriage.querySelector('.userPerson');
        if($spouseName.textContent === spouseName){
          relationship.addFact(cardToFact($marriage, 'http://gedcomx.org/Marriage'));
        }
      });
    }
    
    $children.forEach(function($childCard){
      var child = getPersonFromCard(gedx, $childCard);
      gedx.addPerson(child);
      gedx.addRelationship({
        type: 'http://gedcomx.org/ParentChild',
        person1: primaryPerson,
        person2: child
      });
      if(spouse){
        gedx.addRelationship({
          type: 'http://gedcomx.org/ParentChild',
          person1: spouse,
          person2: child
        });
      }
    });
  });
  
  // Agent
  var agent = GedcomX.Agent()
    .setId('agent')
    .addName({
      lang: 'en',
      value: 'Ancestry'
    })
    .setHomepage({
      resource: 'http://www.ancestry.com'
    });
  gedx.addAgent(agent);
  
  // Sources
  // Recommended format by EE:
  // https://www.evidenceexplained.com/comment/1002#comment-1002
  // TODO: try to get the name of the tree
  var fullNameText = primaryPerson.getNames()[0].getNameForms()[0].getFullText();
  var sourceDescription = GedcomX.SourceDescription()
    .setAbout(window.document.location.href)
    .addTitle({
      value: fullNameText + ' - Ancestry Public Member Trees'
    })
    .addCitation({
      value: '"Public Member Trees", database, Ancestry.com (' + window.document.location.href
        + ' : accessed ' + utils.getDateString() + '), profile for ' + fullNameText + '.'
    })
    .setRepository({
      resource: '#agent'
    });
  gedx.addSourceDescriptionToAll(sourceDescription);
  
  // TODO: include sources listed in this profile and try to figure out which
  // facts they are listed as supporting
  
  emitter.emit('data', gedx);
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
 * Create a GedcomX person from a card
 * 
 * @param {GedcomX} gedx
 * @param {HTMLElement} $card
 * @returns {GedcomX.Person}
 */
function getPersonFromCard(gedx, $card){
  var person = GedcomX.Person({
    id: getPersonIdFromUrl($card.href),
    identifiers: {
      'http://gedcomx.org/Primary': $card.href
    }
  }).addSimpleName(getPersonName($card));
  var $lifespan = $card.querySelector('.userCardSubTitle');
  if($lifespan){
    var lifespanParts = $lifespan.textContent.trim().split('–'),
        birthYear = lifespanParts[0],
        deathYear = lifespanParts[1];
    if(birthYear){
      person.addFact({
        type: 'http://gedcomx.org/Birth',
        date: {
          original: birthYear,
          formal: '+' + birthYear
        }
      });
    }
    if(deathYear){
      person.addFact({
        type: 'http://gedcomx.org/Death',
        date: {
          original: deathYear,
          formal: '+' + deathYear
        }
      });
    }
  }
  return person;
}

/**
 * Get the name from a family member card
 * 
 * @param {HTMLElement} card
 * @returns {String}
 */
function getPersonName(card){
  return firstChildText(card.querySelector('.userCardTitle'));
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
      return curNode.nodeValue.trim();
    }
  }
}

/**
 * Create a GedcomX Fact from a fact card
 * 
 * @param {HTMLElement} $card
 * @param {String} factType
 * @returns {GedcomX.Fact}
 */
function cardToFact($card, factType){
  var $date = $card.querySelector('.factItemDate'),
      date = $date ? utils.toTitleCase($date.textContent.trim()) : null,
      $place = $card.querySelector('.factItemLocation'),
      place = $place ? $place.textContent.trim() : null,
      fact = GedcomX.Fact({
        type: factType
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
}

/**
 * Get all relationship lists separated into categories: parents, siblings, halfsiblings, spouses
 * 
 * @param {HTMLElement}
 * @returns {Object}
 */
function getRelLists($dom){
  var lists = {
    
    // Right now Ancestry only shows one set of parents. We assume multiple
    // in case that changes in the future (it really should).
    'parents': [],
    
    // Since we only have one set of parents we also only have one set of siblings
    'siblings': [],
    
    // I don't know that we can do anything with half siblings
    'halfsiblings': [],
    
    // Spouses lists include children
    'spouses': []
  };
  
  // Get subtitles so that we know which type of list we're looking at
  var $familySection = $dom.querySelector('#familySection'),
      familyNodes = $familySection.querySelectorAll('.factsSubtitle, .researchList, .toggleSiblingsButton'),
      currentNode, listType = 'parents';
  for(var i = 0; i < familyNodes.length; i++){
    currentNode = familyNodes[i];
    
    // Subtitle
    if(currentNode.classList.contains('factsSubtitle')){
      switch(currentNode.textContent.toLowerCase()){
        case 'parents':
          listType = 'parents';
          break;
        case 'half siblings':
          listType = 'halfsiblings';
          break;
        case 'spouse':
        case 'spouse & children':
          listType = 'spouses';
          break;
      }
    }
    
    // Siblings button
    else if(currentNode.classList.contains('toggleSiblingsButton')){
      listType = 'siblings';
    }
    
    // List
    else if(currentNode.classList.contains('researchList')){
      lists[listType].push(currentNode);
    }
  }
  
  return lists;
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
        return cardToFact(card, gedxType);
      });
    }
    
  };
  
}

/**
 * Given the URL of a person, return an ID of the format ${treeId}-${personId}.
 * 
 * @param {String} url
 * @return {String}
 */
function getPersonIdFromUrl(url) {
  var parts = url.split('/');
  // http://person.ancestry.com/tree/70025770/person/30322313653
  return parts[4] + '-' + parts[6];
}