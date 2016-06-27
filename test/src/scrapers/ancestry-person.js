var nock = require('nock'),
    helpers = require('../../testHelpers'),
    genscrape = require('../../../'),
    debug = require('debug')('genscrape:tests:ancestry-person'),
    pagesDir = __dirname + '/../../data/ancestry-person/pages',
    outputDir = __dirname + '/../../data/ancestry-person/output';

describe('ancestry person', function(){

  it('basic', setupTest('70025770', '30206952907'));
  
  it('no facts', setupTest('70025770', '30206952926'));
  
  it('missing parents', setupTest('70025770', '30206952959'));

  it('missing spouse', setupTest('70025770', '30206952953'));
  
  it('multiple spouses');
  
  it('child of unknown spouse');
  
});

/**
 * Setup a ancestry person test
 * 
 * @param {String} treeId
 * @param {String} personId
 * @returns {Function} - The actual test method that mocha will run
 */
function setupTest(treeId, personId){
  debug(`setup ${treeId}:${personId}`);
  
  var inputFile = `${pagesDir}/${treeId}-${personId}.json`,
      outputFile = `${outputDir}/${treeId}-${personId}.json`;
  
  // Setup nock to respond to the AJAX request that will be made by the scraper
  nock('http://person.ancestry.com')
    .defaultReplyHeaders({
      'content-type': 'application/json'
    })
    .get(`/tree/${treeId}/person/${personId}/content/factsbody`)
    .replyWithFile(200, inputFile);
    
  // Create and return the actual test method  
  return function(done){
    debug(`test ${treeId}:${personId}`);
    
    // Setup a mock browser window
    helpers.mockWindow(`http://person.ancestry.com/tree/${treeId}/person/${personId}`, function(){
      debug('window setup');
      
      // Run genscrape
      genscrape().on('data', function(data){
        
        // Test
        done(helpers.compareOrRecordOutput(data, outputFile));
      }).on('error', done);
    });
  };
}