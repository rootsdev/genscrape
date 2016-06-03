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
  window.onhashchange = function(){
    processHash(emitter);
  };
  processHash(emitter);
}

// Called every time the hash changes
function processHash(emitter) {    
  debug('processHash');

  // Remove previous search links and show the ajax loader
  var hashParts = utils.getHashParts();
  
  debug('hashParts', hashParts);
  
  if( hashParts['view'] == 'ancestor' ) {
    
    var personId = hashParts['person'];
    
    // If we have a personId and we are in the ancestor view then fetch the data
    if(personId) {
      
      debug('personId', personId);
      
      // Get person info
      utils.getJSON('https://familysearch.org/platform/tree/persons-with-relationships?persons&person=' + personId, function(error, json){
        if(error){
          debug('error');
          emitter.emit('error', error);
        } else {
          debug('data');
          emitter.emit('data', GedcomX(json));
        }
      });
      
    } else {
      emitter.emit('noData');
      debug('no personId');
    }
  } else {
    emitter.emit('noData');
    debug('not in the ancestor view');
  }
}