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
      
      // Multiple persons can be marked as principal in FS records. We only want
      // one to be marked as principal so we need to fix that.
      // 
      // We use the current URL to determine who the focus person is. But there
      // are two issues we need to account for:
      // 1. The URL could have query parameters
      // 2. The URL could be in either pal or ark format.
      //
      // The solution is to remove query params from the URL then covert it into
      // an ark URL (if it's a pal). Then we can compare the resulting URL to
      // the persistent identifiers on the persons which are always in ark format.
      var url = document.location.origin + document.location.pathname;
      if(/\/pal:\//.test(url)){
        url = url.replace('/pal:/MM9.1.1/', '/ark:/61903/1:1:');
      }
      
      // Set primary identifiers for all persons
      gedx.getPersons().forEach(function(person){
        var identifiers = person.getIdentifiers();
        identifiers.setValues(identifiers.getValues('http://gedcomx.org/Persistent'), 'http://gedcomx.org/Primary');
      });
      
      // Agent
      gedx.addAgent(GedcomX.Agent()
        .setId('agent')
        .addName({
          lang: 'en',
          value: 'FamilySearch'
        })
        .setHomepage({
          resource: 'http://familysearch.org'
        }));
      
      // For some reason the persons are not linked to their source descriptions
      // so here we also setup the links.
      gedx.getPersons().forEach(function(person){
        var identifiers = person.getIdentifiers(),
            ark;
        if(identifiers){
          ark = identifiers.getValues('http://gedcomx.org/Persistent')[0];
          
          // Fix principal flag
          if(ark && ark === url){
            person.setPrincipal(true);
          } else {
            person.setPrincipal();
          }
          
          // Fix sources; connect to agent
          if(ark){
            gedx.getSourceDescriptions().forEach(function(sourceDescription){
              if(sourceDescription.getAbout() === ark){
                person.addSource({
                  description: '#' + sourceDescription.getId()
                });
                sourceDescription.setRepository({
                  resource: '#agent'
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