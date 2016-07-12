var debug = require('debug')('genscrape:utils');

var monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

var utils = {};

/**
 * Get a human readable format of the current date
 * 
 * @returns {String}
 */
utils.getDateString = function(){
  var date = new Date();
  return date.getDate() + ' ' + monthNames[date.getMonth()] + ' ' + date.getFullYear();
};

/**
 * Returns an array of strings with [0] being the given names and 
 * [1] being the family name. This function assumes that there is 
 * only one family name.
 */
utils.splitName = function(name) {
  if(typeof name === 'string' && name) {    
    return name.split(/\s+(?=\S*$)/);
  } else {
    return ['',''];
  }
};

/**
 * Takes in a simple url match pattern and returns a regex
 * for matching. Special chars are escaped except for * which
 * will have a . prepended to it.
 */
utils.urlPatternToRegex = function(pattern){
  pattern = pattern.replace(/\//g, '\/');
  pattern = pattern.replace(/\./g, '\.');
  pattern = pattern.replace(/\-/g, '\-');
  pattern = pattern.replace(/\*/g, '.*');
  return new RegExp(pattern);
};

/**
 * Returns the hash values as a map {key:value}
 */
utils.getHashParts = function() {
  var hashParts = {};
  if( window.location.hash ) {
    window.location.hash.substring(1).split('&').forEach(function(part) {
      var partPieces = part.split('=');
      hashParts[partPieces[0]] = partPieces[1];
    });
  }
  return hashParts;
};

/**
 * Return query params as a map
 */
utils.getQueryParams = function(){
  var paramArray = window.location.search.substr(1).split("&");
  var params = {};

  for ( var i = 0; i < paramArray.length; i++) {
    if(paramArray[i]){
      var tempArray = paramArray[i].split("=");
      params[tempArray[0]] = tempArray[1];
    }
  }
  
  return params;
};

/**
 * Return an empty object if passed in a null or undefined
 */
utils.maybe = function(value) {
  return value != null ? value : {}; // != null also covers undefined
};

/**
 * Capitalizes a string according to title case (first letter of each word)
 */
utils.toTitleCase = function(str){
  return str.replace(/\w\S*/g, function(txt){
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

/**
 * Find the first matching object in an array
 */
utils.find = function(list, matcher){
  for(var i = 0; i < list.length; i++){
    if(matcher(list[i])){
      return list[i];
    }
  }
};

/**
 * Simple JSON AJAX without jQuery
 * http://youmightnotneedjquery.com/#json
 * 
 * @param {String} url
 * @param {Object=} headers - optional map of headers
 * @param {Function} callback - function(error, data)
 */
utils.getJSON = function(url, headers, callback){
  
  if(typeof headers === 'function' && typeof callback === 'undefined'){
    callback = headers;
    headers = [];
  }
  
  // Create the request
  debug('getJSON: ' + url);
  var request = new window.XMLHttpRequest();
  request.open('GET', url);
  
  // Process headers
  for(var header in headers){
    request.setRequestHeader(header, headers[header]);
  }
  
  // Finished handler
  request.onload = function() {
    debug('getJSON:onload');
    
    // Good HTTP response
    if (request.status >= 200 && request.status < 400) {
      debug('getJSON:success');
      
      try {
        callback(undefined, JSON.parse(request.responseText));
      } catch (e) {
        callback(e);
      }
    } 
    
    // HTTP error
    else {
      debug('getJSON:http error');
      callback(new Error(request.statusText));
    }
  };
  
  // Error handler
  request.onerror = function(e) {
    debug('getJSON:onerror');
    callback(new Error('Network error'));
  };
  
  // We can send it now that we've attached the event handlers
  request.send();
};

module.exports = utils;