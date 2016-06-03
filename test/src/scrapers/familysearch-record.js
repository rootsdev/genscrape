var fs = require('fs'),
    nock = require('nock'),
    expect = require('chai').expect,
    helpers = require('../../testHelpers'),
    genscrape = require('../../../'),
    debug = require('debug')('genscrape:test:familysearch-record'),
    pagesDir = __dirname + '/../../data/familysearch/records/pages',
    outputDir = __dirname + '/../../data/familysearch/records/output';

describe.only('familysearch record', function(){
  
  it('process record data', setupPal('MZ87-RG9'));
  
  it('include death and spouse', setupPal('XZLW-29S'));
  
  it('record with no name', setupPal('V8Q1-4LK'));
  
  it('ark', setupArk('MNCT-SDC'));
  
});

/**
 * Sets up a test for a record using a PAL URL
 * 
 * @param {String} recordId
 * @returns {Function} A function(done) that serves as the test method.
 */
function setupPal(recordId){
  return setupTest('/pal:/MM9.1.1/', recordId);
}

/**
 * Sets up a test for a record using an ARK URL
 * 
 * @param {String} recordId
 * @returns {Function} A function(done) that serves as the test method.
 */
function setupArk(recordId){
  return setupTest('/ark:/61903/1:1:', recordId);
}

/**
 * Setup a familysearch record test
 * 
 * @param {String} urlPath - URL path prefix for the record's URL. Allows us to
 *  test both ARKs and PALs
 * @param {String} recordId
 * @returns {Function} - The actual test method that mocha will run
 */
function setupTest(urlPath, recordId){
  debug(`setup ${urlPath}${recordId}`);
  
  var inputFile = `${pagesDir}/${recordId}.json`,
      outputFile = `${outputDir}/${recordId}.json`;
  
  // Setup nock to respond to the AJAX request that will be made by the scraper
  nock('https://familysearch.org')
    .defaultReplyHeaders({
      'content-type': 'application/json'
    })
    .get(urlPath + recordId)
    .replyWithFile(200, inputFile);
  
  // Create and return the actual test method  
  return function(done){
    debug(`test ${urlPath}${recordId}`);
    
    // Setup a mock browser window
    helpers.mockWindow(`https://familysearch.org${urlPath}${recordId}`, function(){
      debug('window setup');
      
      // Run genscrape
      genscrape().on('data', function(data){
        
        // If we're recording, save the output
        if(process.env.GENSCRAPE_RECORDING){
          debug(`recording ${urlPath}${recordId}`);
          console.log('writing ' + outputFile);
          fs.writeFileSync(outputFile, JSON.stringify(data.toJSON(), null, 2));
        }
        
        // If we're not recording, compare the output to what we've previously recorded
        else {
          expect(data.toJSON()).to.deep.equal(loadJsonSync(outputFile));
        }
          
        done();
      }).on('error', done);
    });
  };
}

function loadJsonSync(file){
  debug('loadJsonSync: ' + file);
  return JSON.parse(fs.readFileSync(file), {encoding: 'utf8'});
}