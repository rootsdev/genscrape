var nock = require('nock'),
    path = require('path'),
    expect = require('chai').expect,
    helpers = require('../testHelpers'),
    genscrape = require(path.join(__dirname, '..', '..'));

describe.only('findmypast ancestor', function(){
  
  it('process data', function(done){
    
    nockSetup('1079720865');
    nockSetup('1079720864');
      
    helpers.mockWindow('http://tree.findmypast.co.uk/#/trees/863a418d-78de-43e6-9af6-c9ce320a86ef/1079720865/profile', function(){
      
      var dataEvents = 0,
          noDataEvents = 0;
        
      genscrape()
      .on('noData', function(){
        noDataEvents++;
        
        if(noDataEvents === 1){
          window.location.hash = '#/trees/863a418d-78de-43e6-9af6-c9ce320a86ef/1079720864/media';
          window.onhashchange();
        }
      })
      .on('data', function(data){
        dataEvents++;
        
        if(dataEvents === 1){
          expect(noDataEvents).to.equal(0);
          expect(data).to.deep.equal({ 
            givenName: 'Albert John',
            familyName: 'Zierak',
            birthDate: '1860-04-04',
            birthPlace: 'Lipinki, Gorlice, Poland',
            deathDate: '1951-03-26',
            deathPlace: 'Amsterdam, Montgomery, New York, United States',
            marriageDate: '1886',
            marriagePlace: 'United States',
            spouseGivenName: 'Mary',
            spouseFamilyName: 'Wojnowski',
            motherGivenName: 'Katherine',
            motherFamilyName: 'Zierak',
            fatherGivenName: 'Andrew',
            fatherFamilyName: 'Zierak' 
          });
          window.location.hash = '#/trees/863a418d-78de-43e6-9af6-c9ce320a86ef/all-hints';
          window.onhashchange();
        }
        
        else if(dataEvents === 2){
          expect(noDataEvents).to.equal(1);
          expect(data).to.deep.equal({ 
            givenName: 'Helen Gertrude',
            familyName: 'Zierak',
            birthPlace: 'Amsterdam, Montgomery, New York, United States',
            birthDate: '1896-02-07',
            deathPlace: 'Tacoma, Pierce, Washington, United States',
            deathDate: '1970-11-24',
            fatherGivenName: 'Albert John',
            fatherFamilyName: 'Zierak',
            motherGivenName: 'Mary',
            motherFamilyName: 'Wojnowski',
            spouseGivenName: 'Theodore',
            spouseFamilyName: 'Yurkiewicz',
            marriageDate: '1918-06-18',
            marriagePlace: 'Amsterdam, Montgomery, New York, United States'
          });
          done();
        }
        
        else {
          expect(true).to.be.false;
        }

      });
    });
  });
  
});

/**
 * Configure nock to respond properly to requests
 * for the given person with test data
 */
function nockSetup(personId){
  nock('http://tree.findmypast.co.uk')
    .defaultReplyHeaders({
      'content-type': 'application/json'
    })
    .get('/api/proxy/get?url=api%2Ffamilytree%2Fgetfamilytree%3Ffamilytreeview%3DProfileRelations%26personId%3D'+personId)
    .replyWithFile(200, path.join(__dirname, '..', 'responses', 'findmypast', 'tree', personId+'.json'));
}