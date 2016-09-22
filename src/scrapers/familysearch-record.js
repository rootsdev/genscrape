var debug = require('debug')('genscrape:scrapers:familysearch-record'),
    utils = require('../utils'),
    GedcomX = require('gedcomx-js');

var urls = [
  utils.urlPatternToRegex("https://familysearch.org/pal:/MM9.1.1/*"),
  utils.urlPatternToRegex("https://familysearch.org/ark:/61903/1:1:*")
];

module.exports = function(register){
  register(urls, run);
};

function run(emitter){
  debug('running');
  utils.getJSON(window.location.href, {Accept:'application/x-fs-v1+json'}, function(error, json){
    if(error){
      debug('error');
      emitter.emit('error', error);
    } else {
      debug('data');
      
      var gedx = GedcomX(json);
      
      // For some reason the persons are not linked to their source descriptions
      // so here we setup the links.
      gedx.getPersons().forEach(function(person){
        var identifiers = person.getIdentifiers(),
            ark;
        if(identifiers){
          ark = identifiers.getValues('http://gedcomx.org/Persistent')[0];
          if(ark){
            gedx.getSourceDescriptions().forEach(function(sourceDescription){
              if(sourceDescription.getAbout() === ark){
                person.addSource({
                  description: '#' + sourceDescription.getId()
                });
              }
            });
          }
        }
      });
      
      emitter.emit('data', gedx);
    }
  });
}