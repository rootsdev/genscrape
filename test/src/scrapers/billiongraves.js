var helpers = require('../../testHelpers'),
    genscrape = require('../../../'),
    debug = require('debug')('genscrape:tests:billiongraves'),
    pagesDir = __dirname + '/../../data/billiongraves/pages',
    outputDir = __dirname + '/../../data/billiongraves/output';
    
describe('billiongraves', function(){
  
  it('name and death', setupTest(
    'Lucinda',
    'http://billiongraves.com/grave/LUCINDA-CLARK/216756'
  ));
  
  it('include birth', setupTest(
    'Joseph',
    'http://billiongraves.com/grave/JOSEPH-CLARK/245670'
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