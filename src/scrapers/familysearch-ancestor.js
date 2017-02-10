var debug = require('debug')('genscrape:scrapers:familysearch-ancestor'),
    utils = require('../utils'),
    GedcomX = require('gedcomx-js');

var urls = [
  utils.urlPatternToRegex("https://familysearch.org/tree/*")
];

module.exports = function(register){
  register(urls, run);
};

function run(emitter){
  debug('run');
  
  // The Family Tree uses the HTML5 History API. Sometimes popstate events are
  // fired, sometimes their not. Therefore we must do polling of the URL to
  // detect any changes.
  var path = window.location.pathname;
  
  window.setInterval(function(){
    debug('polling');
    if(window.location.pathname !== path){
      path = window.location.pathname;
      debug('new path ' + path);
      processUrl(emitter);
    }
  }, 100);
  
  processUrl(emitter);
}

// Called every time the URL changes
function processUrl(emitter) {    
  debug('processUrl');

  // Try to get a personId
  if(window.location.pathname.indexOf('/tree/person/') === 0){
    
    var personId = window.location.pathname.split('/')[3];
    
    // If we have a personId and we are in the ancestor view then fetch the data
    if(personId) {
      
      debug('personId', personId);
      
      // Get person info
      getPersonAndRelationships(personId, function(error, json){
        if(error){
          debug('error');
          emitter.emit('error', error);
        } else {
          debug('data');
          
          // For some reason the persons are not linked to the high-level source
          // description that links to Family Tree so here we setup that link.
          // We also mark the principal person.
          
          var gedx = GedcomX(json),
              descriptionRef = gedx.getDescription();
              
          if(descriptionRef){
            gedx.getPersons().forEach(function(person){
              if(person.getId() === personId){
                person.addSource({
                  description: descriptionRef
                });
                person.setPrincipal(true);
              }
            });
          }
          
          // Set primary identifiers for all persons
          gedx.getPersons().forEach(function(person){
            var identifiers = person.getIdentifiers();
            identifiers.setValues(identifiers.getValues('http://gedcomx.org/Persistent'), 'http://gedcomx.org/Primary');
          });
          
          // Add the agent and connect to the root source description
          var agent = GedcomX.Agent({
            id: 'agent',
            names: [{
              lang: 'en',
              value: 'FamilySearch Family Tree'
            }],
            homepage: {
              resource: 'https://familysearch.org/tree'
            }
          });
          gedx.addAgent(agent);
          var description = gedx.getSourceDescriptions().filter(function(d){
            return d.getId() === descriptionRef.substring(1);
          })[0];
          if(description){
            description.setRepository({
              resource: '#agent'
            });
          }
          
          emitter.emit('data', gedx);
        }
      });
      
    } else {
      emitter.emit('noData');
      debug('no personId');
    }
  } else {
    emitter.emit('noData');
    debug('not in person view');
  }
}

/**
 * Get a person and all their 1st degree relationships
 * 
 * @param {String} personId
 * @param {Function} callback
 */
function getPersonAndRelationships(personId, callback){
  debug('getPersonAndRelationships: ' + personId);
  utils.getJSON('https://familysearch.org/platform/tree/persons/' + personId + '?relatives', {
    'X-FS-Feature-Tag': 'consolidate-redundant-resources'
  }, callback);
}