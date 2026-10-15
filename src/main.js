var debug = require('debug')('genscrape:main'),
    EventEmitter2 = require('eventemitter2').EventEmitter2,
    generic = require('./generic');

/**
 * Main genscrape function.
 *
 * Compares the current url to the list of regexes registered by the scrapers to
 * find a scraper that can handle this page.
 *
 * When no scraper matches, the generic extractor reads the page instead. It
 * emits 'data' (with a second argument of {generic: true, strategy}) if it
 * finds a person with at least one event or relative; otherwise 'noMatch'.
 * Pass {generic: false} to always emit 'noMatch' for unsupported sites.
 *
 * Returns an EventEmitter object.
 */
var genscrape = function(options){
  options = options || {};
  var emitter = new EventEmitter2();
  var thisUrl = window.location.href;
  debug('url', thisUrl);

  // Loop through all registered scrapers
  var i, j, scraper, regex, match = false;
  for(i = 0; i < scrapers.length && !match; i++){
    scraper = scrapers[i];

    // Loop through all url regex matchers for this scraper
    for(j = 0; j < scraper.urls.length && !match; j++){
      regex = scraper.urls[j];
      debug(regex);

      // We have a match
      if(regex.test(thisUrl)){
        debug('match');
        setTimeout(function(){
          scraper.scraper(emitter);
        });
        match = true; // For short-circuiting the match loops
      }
    }
  }

  // Nothing matched. Try the generic extractor, then send a 'noMatch' event.
  if(!match){
    debug('no match');
    setTimeout(function(){
      var result = null;
      if(options.generic !== false){
        try {
          result = generic.extract(window.document, thisUrl);
        } catch(e) {
          debug('generic failed', e);
        }
      }
      if(result && generic.isUsable(result.record)){
        debug('generic', result.strategy);
        emitter.emit('data', result.gedx, { generic: true, strategy: result.strategy });
      } else {
        emitter.emit('noMatch');
      }
    });
  }

  return emitter;
};

// TODO: remove `genscrape._scrapers`. It's not being used. Perhaps it could
// be useful for debugging but we've never actually used it.
var scrapers = genscrape._scrapers = [];

/**
 * Register a scraper.
 *
 * @param {Object} config
 * @param {Regex[]} config.urls Regex for matching URLs
 * @param {Function} config.scraper Initiates scraper and returns and EventEmitter object
 */
var register = genscrape.register = function(urls, scraper){
  // TODO: prevent duplicate registration
  debug('register');
  if(Array.isArray(urls) && typeof scraper === 'function'){
    scrapers.push({
      urls: urls,
      scraper: scraper
    });
  }
};

module.exports = genscrape;

require('./gedx-extensions');

// Include scrapers. This is primarily done so that
// browserify can find and include them.
// TODO: find a method that allows us to dynamically include all scrapers
require('./scrapers/ancestry-record')(register);
require('./scrapers/ancestry-person')(register);
require('./scrapers/billiongraves')(register);
require('./scrapers/familysearch-record')(register);
require('./scrapers/familysearch-ancestor')(register);
require('./scrapers/findagrave')(register);
require('./scrapers/findagrave-new')(register);
require('./scrapers/findmypast-record')(register);
require('./scrapers/findmypast-tree')(register);
require('./scrapers/genealogieonline')(register);
require('./scrapers/openarch')(register);
require('./scrapers/werelate')(register);
require('./scrapers/wikitree')(register);
require('./scrapers/myheritage-record')(register);
require('./scrapers/myheritage-person')(register);
require('./scrapers/fold3-memorial')(register);
require('./scrapers/abmc')(register);
require('./scrapers/cvwm')(register);
require('./scrapers/awm')(register);
require('./scrapers/familysearch-ancestors-public')(register);
require('./scrapers/thepeerage')(register);
require('./scrapers/gedbas')(register);
require('./scrapers/rodovid')(register);
require('./scrapers/geneanet')(register);
require('./scrapers/geni')(register);
require('./scrapers/digitalarkivet')(register);
require('./scrapers/legacy')(register);
require('./scrapers/archieven')(register);
require('./scrapers/freereg')(register);
require('./scrapers/freecen')(register);
require('./scrapers/irishgenealogy')(register);
