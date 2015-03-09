var debug = require('debug')('fs-ancestor'),
    utils = require('../utils'),
    request = require('superagent'),
    Emitter = require('events').EventEmitter;

var urls = [
  utils.urlPatternToRegex("https://familysearch.org/tree/*")
];

module.exports = function(register){
  register(urls, run);
};

function run(){
  debug('run');
  var emitter = new Emitter();
  window.onhashchange = function(){
    processHash(emitter);
  };
  processHash(emitter);
  return emitter;
}

// Called every time the hash changes
function processHash(emitter) {    
  debug('processHash');

  // Remove previous search links and show the ajax loader
  var hashParts = utils.getHashParts();
  
  debug('hashParts', hashParts);
  
  if( hashParts['view'] == 'ancestor' ) {
    
    // Get personId and spouseId
    var personId = hashParts['person'];
    var spouseId = hashParts['spouse'];
    
    // If we have a personId and we are in the ancestor view, build the urls
    if(personId) {
      
      // Get person info; process it when both ajax calls return
      multiRequest([getPersonSummary(personId), getRelationships(personId,spouseId)])
      .on('responses', function(summaryResponse, relationshipsResponse) {
        
        try {
          // Get actual return data
          var summary = summaryResponse.body;
          var relationships = relationshipsResponse.body;
          
          // Check to see if we have person data
          if(summary.data){
            var personData = normalizeData(summary, relationships);
            debug('data');
            emitter.emit('data', personData);
          } else {
            debug('no summary data');
            emitter.emit('noData');
          }
        } catch(error) {
          emitter.emit('error', error);
          debug('error processing data', error);
        }
        
      })
      .on('error', function(error){
        debug('ajax error', error);
      }); 
    } else {
      emitter.emit('noData');
      debug('no personId');
    }
  } else {
    emitter.emit('noData');
    debug('not in the ancestor view');
  }
}

function normalizeData(summary, relationships) {
  var gender = summary.data.gender,
      fatherName = ['',''],
      motherName = ['',''],
      spouseName = ['',''];
  
  // Process parents if there is a relationship
  if(relationships.data && relationships.data.parents.length) {
    fatherName = utils.splitName(relationships.data.parents[0].husband.name);
    motherName = utils.splitName(relationships.data.parents[0].wife.name);
  }
  
  // Process spouse if there is a spouse relationship
  if(relationships.data && relationships.data.spouses.length) {
    if(gender == 'MALE' && relationships.data.spouses[0].wife) {
      spouseName = utils.splitName(relationships.data.spouses[0].wife.name);
    } else if(gender == 'FEMALE' && relationships.data.spouses[0].husband) {
      spouseName = utils.splitName(relationships.data.spouses[0].husband.name);
    }
  }
  
  var data = {
    'givenName': getSummaryInfo(summary, ['data', 'nameConclusion', 'details', 'nameForms', 0, 'givenPart']),
    'familyName': getSummaryInfo(summary, ['data', 'nameConclusion', 'details', 'nameForms', 0, 'familyPart']),
    'birthPlace': getConclusionPlace(getSummaryInfo(summary, ['data', 'birthConclusion'])),
    'birthDate': getConclusionDate(getSummaryInfo(summary, ['data', 'birthConclusion'])),
    'deathPlace': getConclusionPlace(getSummaryInfo(summary, ['data', 'deathConclusion'])),
    'deathDate': getConclusionDate(getSummaryInfo(summary, ['data', 'deathConclusion'])),
    'fatherGivenName': fatherName[0],
    'fatherFamilyName': fatherName[1],
    'motherGivenName': motherName[0],
    'motherFamilyName': motherName[1],
    'spouseGivenName': spouseName[0],
    'spouseFamilyName': spouseName[1]
  };
  
  if(relationships.data && relationships.data.spouses[0].event) {
    data.marriageDate = relationships.data.spouses[0].event.standardDate;
    data.marriagePlace = relationships.data.spouses[0].event.standardPlace;
  }
  
  return data;
}

function getConclusionPlace(conclusion){
  if(conclusion){
    return getSummaryInfo(conclusion, ['details', 'place', 'normalizedText']) || getSummaryInfo(conclusion, ['details', 'place', 'originalText']);
  }
}

function getConclusionDate(conclusion){
  if(conclusion){
    return getSummaryInfo(conclusion, ['details', 'date', 'normalizedText']) || getSummaryInfo(conclusion, ['details', 'date', 'originalText']);
  }
}

// Iterate over a list of attributes which define the path
// through an object to a desired piece of data. Stop when
// we reach the last attribute (and return its value)
// or when we find something that is undefined (return undefined)
function getSummaryInfo(summary, attributes) {
  var current = summary;
  for(var i = 0; i < attributes.length; i++) {
    current = current[attributes[i]];
    if( current == undefined ) {
      return undefined;
    }
  }
  return current;
}

// Makes an ajax call to retrieve the persons summary data and returns a promise
function getPersonSummary(personId) {
  return getJSON('https://familysearch.org/tree-data/person/'+personId+'/summary');
}

// Makes an ajax call to retrieve relationship info and returns a promise
function getRelationships(personId, spouseId) {
  var url = 'https://familysearch.org/tree-data/family-members/person/'+personId;
  if(spouseId)
    url += '?spouseId='+spouseId;
  return getJSON(url);
}

// JSON AJAX request
function getJSON(url){
  return request.get(url)
    .set('accept','application/json');
}

// Handle multiple requests
// Returns emitter object
// Error fired for each error
// `responses` event fired once iff all responses succeed
// Wrote this so that I wouldn't have to include an entire promises lib
function multiRequest(requests){
  debug('multiRequest');
  var responses = [],
      length = requests.length,
      count = 0,
      emitter = new Emitter();
  utils.forEach(requests, function(req, i){
    debug('request', i);
    req.end(function(err, res){
      if(err){
        debug('multiRequest error');
        emitter.emit('error', err);
      } else {
        debug('multiRequest response');
        responses[i] = res;
        count++;
        if(count == length){
          debug('multiRequest responses');
          emitter.emit.apply(emitter, ['responses'].concat(responses)) ;
        }
      }
    })
  })
  return emitter;
}