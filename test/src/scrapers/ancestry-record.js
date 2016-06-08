var helpers = require('../../testHelpers'),
    genscrape = require('../../../'),
    debug = require('debug')('genscrape:tests:ancestry-record'),
    pagesDir = __dirname + '/../../data/ancestry/records/pages',
    outputDir = __dirname + '/../../data/ancestry/records/output';
    
describe.only('ancestry-record', function(){

  it('1880 census; parents names', setupTest('1880-2376696','http://search.ancestry.com/cgi-bin/sse.dll?db=1880usfedcen&h=2376696&indiv=try'));
  
  it('vt vitals; marriage info and different parent names', setupTest('VTVitalRecs-1344848', 'http://search.ancestry.com/cgi-bin/sse.dll?db=VTVitalRecs&h=1344848&indiv=try'));
  
  it('ssdi; death date and other birth date', setupTest('ssdi-64142243', 'http://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=ssdi&h=64142243'));
  
  it('findagrave; other death date', setupTest('findagraveus-8824956', 'http://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=findagraveus&h=8824956'));
  
  it('obituary; many relationships', setupTest('webobituary-22395809','http://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=web-obituary&h=22395809'));
  
  it('no data', function(done){
    var url = 'http://search.ancestry.com/cgi-bin/sse.dll?nodata',
        filePath = pagesDir + '/nodata.html';
    helpers.mockDom(url, filePath, function(){
      genscrape()
        .on('noData', function(){
          done();
        })
        .on('error', done)
        .on('data', function(){
          done(new Error('no data should be emitted'));
        });
    });
  });
  
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