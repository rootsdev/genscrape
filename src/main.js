var debug = require('debug')('main'),
    EventEmitter2 = require('eventemitter2').EventEmitter2,
    _ = require('lodash');

/**
 * Main genscrape function.
 * Compare current location to the list of urls
 * registered by the scrapers to find a scraper
 * that can handle this page.
 * Return an EventEmitter object.
 */
var genscrape = function(){
  var emitter = new EventEmitter2();
  var thisUrl = window.location.href;
  debug('url', thisUrl);
  
  var match = false;
  _.forEach(scrapers, function(scraper){
    _.forEach(scraper.urls, function(regex){
      debug(regex);
      if(regex.test(thisUrl)){
        debug('match');
        setTimeout(function(){
          scraper.scraper(emitter);
        })
        // Short-circuit on match
        match = true;
        return false;
      }
    });
    // Short-circuit on match
    if(match) return false;
  });
  
  // Nothing matched. Return basic EventEmitter
  // that will send a 'noMatch' event.
  if(!match){
    debug('no match');
    setTimeout(function(){
      emitter.emit('noMatch');
    });
  }
  
  return emitter;
};

var scrapers = genscrape._scrapers = [];

/**
 * Register a scraper.
 * Give an array of regex for matching urls
 * and a function to call which begins the process
 * of scraping and returns an EventEmitter object.
 */
var register = genscrape.register = function(urls, scraper){
  // TODO: prevent duplicate registration
  debug('register');
  if(_.isArray(urls) && _.isFunction(scraper)){
    scrapers.push({
      urls: urls,
      scraper: scraper
    });
  }
};

module.exports = genscrape;

// Include scrapers. This is primarily done so that
// browserify can find and include them.
// TODO: find a method that allows us to dynamically include all scrapers
require('./scrapers/ancestry-ancestor')(register);
require('./scrapers/ancestry-record')(register);
require('./scrapers/billiongraves')(register);
require('./scrapers/findagrave')(register);
require('./scrapers/findmypast-tree')(register);
require('./scrapers/fs-record')(register);
require('./scrapers/fs-ancestor')(register);
require('./scrapers/genealogieonline')(register);
require('./scrapers/openarch')(register);
require('./scrapers/werelate')(register);