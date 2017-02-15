var helpers = require('../../testHelpers'),
    genscrape = require('../../../'),
    setupTest = helpers.createTestRunner('ancestry-record');
    
describe.only('ancestry-record', function(){

  it('1880 census; parents names', setupTest(
    '1880-2376696',
    'http://search.ancestry.com/cgi-bin/sse.dll?db=1880usfedcen&h=2376696&indiv=try'
  ));
  
  it('vt vitals; marriage info and different parent names', setupTest(
    'VTVitalRecs-1344848', 
    'http://search.ancestry.com/cgi-bin/sse.dll?db=VTVitalRecs&h=1344848&indiv=try'
  ));
  
  it('ssdi; death date and other birth date', setupTest(
    'ssdi-64142243', 
    'http://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=ssdi&h=64142243'
  ));
  
  it('findagrave; other death date', setupTest(
    'findagraveus-8824956', 
    'http://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=findagraveus&h=8824956'
  ));
  
  it('obituary; many relationships', setupTest(
    'webobituary-22395809',
    'http://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=web-obituary&h=22395809'
  ));
  
  it('1940 US Census', setupTest(
    '1940usfedcen-154240314',
    'http://search.ancestry.com/cgi-bin/sse.dll?db=1940usfedcen&indiv=try&h=154240314'
  ));
  
  it('1900 US Census', setupTest(
    '1900usfedcen-54351117',
    'http://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=1900usfedcen&h=54351117'
  ));
  
  it('Daviess County 1920 Census', setupTest(
    'davies1920-23578',
    'http://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=davies1920&h=23578'
  ));
  
  it('Marion County Oregon Marriage', setupTest(
    'OrMarriages-4777',
    'http://search.ancestry.com/cgi-bin/sse.dll?h=4777&db=OrMarriages&indiv=1'
  ));
  
  it('Virginia Marriage', setupTest(
    'general-9279-30484846',
    'http://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=general-9279&h=30484846'
  ));
  
  it('Missouri Marriage', setupTest(
    'momarriages-504688469',
    'http://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=momarriages&h=504688469'
  ));
  
  it('New York Passenger Lists', setupTest(
    'nypl-14261124',
    'http://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=nypl&h=14261124'
  ));
  
  it('Honolulu, Hawaii, Passenger and Crew Lists', setupTest(
    'HonoluluPL-574941',
    'http://search.ancestry.com/cgi-bin/sse.dll?h=574941&db=HonoluluPL&indiv=1'
  ));
  
  it('no data', function(done){
    var url = 'http://search.ancestry.com/cgi-bin/sse.dll?nodata',
        filePath = __dirname + '/../../data/ancestry-record/pages/nodata.html';
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