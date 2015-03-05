var utils = require('utils'),
    scrapers = [];

/**
 * Main genscrape function.
 * Compare current location to the list of urls
 * registered by the scrapers to find a scraper
 * that can handle this page.
 * Return an EventEmitter object.
 */
var genscrape = function(){

};

/**
 * Register a scraper.
 * Give an array of regex for matching urls
 * and a function to call which begins the process
 * of scraping and returns an EventEmitter object.
 */
genscrape.register = function(urls, scraper){
  // TODO: prevent duplicate registration
  if(utils.isArray(urls) && utils.isFunction(scraper)){
    scrapers.push({
      urls: urls,
      scraper: scraper
    });
  }
};

module.exports = genscrape;