var nock = require('nock'),
    path = require('path'),
    expect = require('chai').expect,
    helpers = require('../testHelpers'),
    genscrape = require(path.join(__dirname, '..', '..'));

describe('fs ancestor', function(){
  
  it('process data and respond to hash changes', function(done){
    var scope = nock('https://familysearch.org')
      .defaultReplyHeaders({
        'content-type': 'application/json'
      })
      .get('/tree-data/person/K2HD-1TC/summary')
      .replyWithFile(200, path.join(__dirname, '..', 'responses', 'fs', 'tree-data', 'K2HD-1TC-summary.json'))
      .get('/tree-data/family-members/person/K2HD-1TC')
      .replyWithFile(200, path.join(__dirname, '..', 'responses', 'fs', 'tree-data', 'K2HD-1TC-family.json'))
      .get('/tree-data/person/KJZ2-417/summary')
      .replyWithFile(200, path.join(__dirname, '..', 'responses', 'fs', 'tree-data', 'KJZ2-417-summary.json'))
      .get('/tree-data/family-members/person/KJZ2-417')
      .replyWithFile(200, path.join(__dirname, '..', 'responses', 'fs', 'tree-data', 'KJZ2-417-family.json'));
      
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
            marriageDate: '11 October 1861',
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
            marriageDate: '1824',
            marriagePlace: 'Endicott, Broome, New York, United States'
          });
          done();
        }
        
        else {
          expect(true).to.be.false;
        }
        
      })
      
    });

  })
  
  it('respond to hash changes', function(){
    // initial setup
    // hash change with no data
    // hash change again with data
  })
  
})