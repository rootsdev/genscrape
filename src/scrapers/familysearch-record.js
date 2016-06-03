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
  utils.getJSON(window.location.href, function(error, json){
    if(error){
      debug('error');
      emitter.emit('error', error);
    } else {
      debug('data');
      emitter.emit('data', GedcomX(json));
    }
  });
}