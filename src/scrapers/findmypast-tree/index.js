var debug = require('debug')('genscrape:scrapers:findmypast-tree'),
    utils = require('../../utils'),
    GedcomX = require('gedcomx-js'),
    Relations = require('./Relations');

var urls = [
  /^http:\/\/tree\.findmypast\.(co\.uk|com|ie|com\.au)/
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

function processHash(emitter){
  debug('processHash');
  
  var urlParts = window.location.hash.split('/'),
      treeId = urlParts[2],
      personId = urlParts[3];
      
   debug('hash: ' + window.location.hash);
   debug('treeId: ' + treeId);
   debug('personId: ' + personId);
      
  if(parseInt(personId, 10)){
    getRelations(treeId, personId, function(error, relations){
      if(error){
        emitter.emit('error', error);
      }
      else if(relations && relations.Object){
        debug('relations data');
        
        // var personData = new Relations(relations.Object).getPersonData(personId);
        
        var gedx = new GedcomX();
        
        emitter.emit('data', gedx);
      } else {
        emitter.emit('noData');
        debug('no relation Object');
      }
    });
  }
  
  else {
    emitter.emit('noData');
    debug('not focused on a person');
  }
  
}

// Basic profile
// http://tree.findmypast.co.uk/api/proxy/get?url=api%2Fperson%2Fgetbasicperson%3FpersonId%3D1079720865

// Relations
// http://tree.findmypast.co.uk/api/proxy/get?url=api%2Ffamilytree%2Fgetfamilytree%3Ffamilytreeview%3DProfileRelations%26personId%3D1079720865

function getRelations(treeId, personId, callback){
  return api(treeId, 'api/familytree/getfamilytree?familytreeview=ProfileRelations&personId=' + personId, callback);
}

/**
 * Proxy API Request
 */
function api(treeId, url, callback){
  debug('api request: ' + url);
  utils.getJSON('/api/proxy/get?url=' + encodeURIComponent(url), {
    'Family-Tree-Ref': treeId
  }, callback);
}