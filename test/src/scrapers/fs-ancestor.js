var nock = require('nock'),
    path = require('path'),
    expect = require('chai').expect,
    helpers = require('../../testHelpers'),
    genscrape = require('../../../');

describe.skip('fs ancestor', function(){
  
  it('process data and respond to hash changes', function(done){
    
    nockSetup('K2HD-1TC');
    nockSetup('KJZ2-417');
      
    helpers.mockWindow('https://familysearch.org/tree/#view=ancestor&person=K2HD-1TC', function(){
      
      var dataEvents = 0,
          noDataEvents = 0;
        
      genscrape()
      .on('noData', function(){
        noDataEvents++;
        
        if(noDataEvents === 1){
          window.location.hash = '#view=ancestor&person=KJZ2-417';
          window.onhashchange();
        }
        
        else {
          expect(true).to.be.false;
        }
      })
      .on('data', function(data){
        dataEvents++;
        
        if(dataEvents === 1){
          expect(noDataEvents).to.equal(0);
          expect(data).to.deep.equal({ givenName: 'John Augustus',
            familyName: 'Sheets',
            birthPlace: 'Philadelphia, Philadelphia, Pennsylvania, United States',
            birthDate: '14 May 1826',
            deathPlace: 'Salt Lake City, Salt Lake, Utah, United States',
            deathDate: '10 September 1904',
            fatherGivenName: 'Peter',
            fatherFamilyName: 'Sheets',
            motherGivenName: 'Mary Ann',
            motherFamilyName: 'Tridy',
            spouseGivenName: 'Elizabeth',
            spouseFamilyName: 'Tricebaugh',
            marriageDate: '27 December 1862',
            marriagePlace: 'Salt Lake City, Salt Lake, Utah, United States'
          });
          window.location.hash = '#view=pedigree';
          window.onhashchange();
        }
        
        else if(dataEvents === 2){
          expect(noDataEvents).to.equal(1);
          expect(data).to.deep.equal({ 
            givenName: 'Lindsay',
            familyName: 'Belding',
            birthPlace: 'Hartford, Hartford, Connecticut, United States',
            birthDate: '1800',
            deathPlace: 'Sinnemahoning, Gibson Township, Cameron, Pennsylvania, United States',
            deathDate: '1875',
            fatherGivenName: 'Amos',
            fatherFamilyName: 'Belding',
            motherGivenName: 'Anna',
            motherFamilyName: 'Day',
            spouseGivenName: 'Jane',
            spouseFamilyName: 'Garrison',
            marriageDate: '15 May 1824',
            marriagePlace: 'Union, Broome, New York'
          });
          done();
        }
        
        else {
          expect(true).to.be.false;
        }
        
      });
    });
  });
  
  it('bad http response', function(done){
    nock('https://familysearch.org')
      .defaultReplyHeaders({
        'content-type': 'application/json'
      })
      .get('/platform/tree/persons-with-relationships?persons&person=MMM')
      .reply(500);
    helpers.mockWindow('https://familysearch.org/tree/#view=ancestor&person=MMM', function(){
      genscrape()
      .on('error', function(e){
        expect(e).to.exist;
        done();
      });
    });
  });
  
  it('ancestor view with no data', function(done){
    helpers.mockWindow('https://familysearch.org/tree/#view=ancestor', function(){
      genscrape()
      .on('noData', function(){
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
  nock('https://familysearch.org')
    .defaultReplyHeaders({
      'content-type': 'application/json'
    })
    .get('/platform/tree/persons-with-relationships?persons&person='+personId)
    .replyWithFile(200, path.join(__dirname, '..', 'responses', 'fs', 'platform', personId+'.json'));
}