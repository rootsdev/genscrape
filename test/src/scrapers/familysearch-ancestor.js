var nock = require('nock'),
    expect = require('chai').expect,
    helpers = require('../../testHelpers'),
    genscrape = require('../../../'),
    debug = require('debug')('genscrape:tests:familysearch-ancestor'),
    pagesDir = __dirname + '/../../data/familysearch-ancestor/pages',
    outputDir = __dirname + '/../../data/familysearch-ancestor/output';

describe('familysearch ancestor', function(){
  
  /**
   * In this crazy test we mock navigation in the tree by changing the URL hash.
   * We want to make sure that we accurately detect hash changes so that we
   * fetch data when in the ancestor view.
   */
  it('process data and respond to hash changes', function(done){
    
    nockSetup('K2HD-1TC');
    nockSetup('KJZ2-417');
      
    helpers.mockWindow('https://familysearch.org/tree/person/K2HD-1TC/details', function(){
      
      var dataEvents = 0,
          noDataEvents = 0,
          error;
        
      genscrape()
        .on('noData', function(){
          debug('noData');
          noDataEvents++;
          
          if(noDataEvents === 1){
            window.history.pushState(null, '', '/tree/person/KJZ2-417/details');
            debug(window.location.pathname);
          }
          
          else {
            expect(true).to.be.false;
          }
        })
        .on('data', function(data){
          debug('data');
          dataEvents++;
          
          if(dataEvents === 1){
            expect(noDataEvents).to.equal(0);
            error = helpers.compareOrRecordOutput(data, outputDir + '/K2HD-1TC.json');
            window.history.pushState(null, '', '/tree/pedigree/KJZ2-417/landscape');
          }
          
          else if(dataEvents === 2){
            expect(noDataEvents).to.equal(1);
            error = error || helpers.compareOrRecordOutput(data, outputDir + '/KJZ2-417.json');
            window.clearInterval(window._genscrapeFSInterval);
            done(error);
          }
          
          else {
            expect(true).to.be.false;
          }
          
        })
        .on('error', done);
    });
  });
  
  it('bad http response', function(done){
    nock('https://familysearch.org')
      .defaultReplyHeaders({
        'content-type': 'application/json'
      })
      .get('/platform/tree/persons-with-relationships?persons&person=MMM')
      .reply(500);
    helpers.mockWindow('https://familysearch.org/tree/person/MMM/details', function(){
      genscrape()
      .on('error', function(e){
        expect(e).to.exist;
        window.clearInterval(window._genscrapeFSInterval);
        done();
      });
    });
  });
  
});

/**
 * Configure nock to respond properly to requests
 * for the given person with test data
 */
function nockSetup(personId){
  debug('nock setup: ' + personId);
  nock('https://familysearch.org')
    .defaultReplyHeaders({
      'content-type': 'application/json'
    })
    .get('/platform/tree/persons/' + personId + '?relatives')
    .replyWithFile(200, pagesDir + '/' + personId + '.json');
}