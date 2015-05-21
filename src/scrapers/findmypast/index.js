var debug = require('debug')('findmypast'),
    utils = require('../../utils'),
    Relations = require('./Relations');

var urls = [
  /http:\/\/tree\.findmypast\.(co\.uk|com|ie|com\.au)\/#\/trees\/[^/]+\/[^/]+\/profile/
];

module.exports = function(register){
  register(urls, run);
};

function run(emitter){
  debug('run');
  
  var urlParts = window.location.hash.split('/'),
      treeId = urlParts[2],
      personId = urlParts[3];
  
  getRelations(treeId, personId).done(function(relations){
    if(relations && relations.Object){
      debug('relations data');
      var personData = new Relations(relations.Object).getPersonData(personId);
      debug('person data', personData);
      emitter.emit('data', personData);
    } else {
      debug('no relation Object');
    }
  });

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
      'Family-Tree-Ref': '863a418d-78de-43e6-9af6-c9ce320a86ef'
    }
  }).fail(function(e){
    debug('api error: ' + url);
    debug(e);
  });
}