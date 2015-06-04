var _ = require('lodash');

var utils = {};

/**
 * Returns an array of strings with [0] being the given names and 
 * [1] being the family name. This function assumes that there is 
 * only one family name.
 */
utils.splitName = function(name) {
  if(_.isString(name) && name) {    
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
    _.forEach(window.location.hash.substring(1).split('&'), function(part) {
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
 * Remove falsy values
 * http://stackoverflow.com/a/26295351/879121
 */
utils.clean = function(obj){
  return _.pick(obj, _.identity);
};

module.exports = utils;