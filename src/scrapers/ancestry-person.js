var debug = require('debug')('ancestry-person'),
    utils = require('../utils');

var urls = [
  utils.urlPatternToRegex('http://person.ancestry.com/tree/*/person/*'),
  utils.urlPatternToRegex('http://person.ancestryinstitution.com/tree/*/person/*')
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
  $.getJSON(factsUrl).then(function(json){
    debug('response');
    
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

    process(emitter, $(json.html.body));
  }, function(error){
    debug('error');
    debug(error);
    emitter.emit('error retrieving json', error);
  });
}

/**
 * Traverse DOM to extract person data
 */
function process(emitter, $dom){
  debug('processing');
  
  var personData = {};
  
  // Gather list of events. Store in map keyed by event title.
  // In the future if we want to gather events that could occur multiple times,
  // such as residence, then we'll need to change this to an array.
  var facts = {};
  
  $dom.find('#factsSection .LifeEvent').each(function(){
    var $card = $(this),
        name = $card.find('.cardSubtitle').text().toLowerCase().trim(),
        value = $card.find('.cardTitle').text().trim();
    facts[name] = value;
  });
  
  debug('facts');
  debug(facts);
  
  // Name
  
  var nameParts = utils.splitName(facts.name);
  personData.givenName = nameParts[0];
  personData.familyName = nameParts[1];
  
  // Vitals
  
  if(facts.birth){
    var birthParts = processEvent(facts.birth);
    personData.birthDate = birthParts[0];
    personData.birthPlace = birthParts[1];
  }
  
  if(facts.death){
    var deathParts = processEvent(facts.death);
    personData.deathDate = deathParts[0];
    personData.deathPlace = deathParts[1];
  }
  
  // Relationships
  
  emitter.emit('data', personData);
}

/**
 * Split the event string on the • which separates the
 * date from the place. Also uncapitalize month abbreviation.
 */
function processEvent(event){
  var parts = event.split(' • ');
  
  // For some reason they capitalize the month abbreviation :|
  parts[0] = utils.toTitleCase(parts[0]);
  
  return parts;
}