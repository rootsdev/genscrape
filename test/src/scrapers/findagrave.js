var helpers = require('../../testHelpers'),
    genscrape = require('../../../'),
    debug = require('debug')('genscrape:tests:findagrave'),
    pagesDir = __dirname + '/../../data/findagrave/pages',
    outputDir = __dirname + '/../../data/findagrave/output';
    
describe.only('findagrave', function(){
  
  it('Not famous; no family', setupTest(
    'raymond-zierak',
    'http://www.findagrave.com/cgi-bin/fg.cgi?page=gr&GRid=65630115'
  ));
  
  it('Famous; no family', setupTest(
    'patty-duke',
    'http://www.findagrave.com/cgi-bin/fg.cgi?page=gr&GRid=160192994'
  ));
  
  it('Multilpe parents; single spouse', setupTest(
    'nancy-reagan',
    'http://www.findagrave.com/cgi-bin/fg.cgi?page=gr&GRid=7657594'
  ));
  
  it('Multiple spouses', setupTest(
    'ronald-reagan',
    'http://www.findagrave.com/cgi-bin/fg.cgi?page=gr&GRid=4244'
  ));
  
  it('Single child', setupTest(
    'kenneth-robbins',
    'http://www.findagrave.com/cgi-bin/fg.cgi?page=gr&GRid=153242774'
  ));
  
  it('Single parent; name suffix', setupTest(
    'thomas-york',
    'http://www.findagrave.com/cgi-bin/fg.cgi?page=gr&GRid=38398001'
  ));
  
  it('Unknown birth; no family', setupTest(
    'boleslaw-barejka',
    'http://www.findagrave.com/cgi-bin/fg.cgi?page=gr&GScid=2140420&GRid=40207050'
  ));
  
  it('Family links with no lifespan', setupTest(
    'robert-coe',
    'http://www.findagrave.com/cgi-bin/fg.cgi?page=gr&GRid=37494703'
  ));
  
});

/**
 * Setup a test
 * 
 * @param {String} url - URL of the test page
 * @param {String} name - Name of the data files without the extension
 * @returns {Function} - The actual test method that mocha will run
 */
function setupTest(name, url){
  debug(`setup ${name}`);
  
  var inputFile = `${pagesDir}/${name}.html`,
      outputFile = `${outputDir}/${name}.json`;
  
  // Create and return the actual test method  
  return function(done){
    debug(`test ${name}`);
    
    // Setup a mock browser window
    helpers.mockDom(url, inputFile, function(){
      debug('dom setup');
      
      // Run genscrape
      genscrape().on('data', function(data){
        
        // Test
        done(helpers.compareOrRecordOutput(data, outputFile));
      }).on('error', done);
    });
  };
}