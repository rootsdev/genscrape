var debug = require('debug')('findmypast-tree'),
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
    getRelations(treeId, personId).done(function(relations){
      if(relations && relations.Object){
        debug('relations data');
        var personData = new Relations(relations.Object).getPersonData(personId);
        debug('person data', personData);
        emitter.emit('data', personData);
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

function getRelations(treeId, personId){
  return api(treeId, 'api/familytree/getfamilytree?familytreeview=ProfileRelations&personId=' + personId);
}

/**
 * Proxy API Request
 */
function api(treeId, url){
  debug('api request: ' + url);
  return $.ajax({
    type: 'GET',
    url: '/api/proxy/get?url=' + encodeURIComponent(url),
    headers: {
      'Family-Tree-Ref': treeId
    }
  }).fail(function(e){
    debug('api error: ' + url);
    debug(e);
  });
}