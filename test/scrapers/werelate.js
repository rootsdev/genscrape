var nock = require('nock'),
    path = require('path'),
    expect = require('chai').expect,
    helpers = require('../testHelpers'),
    genscrape = require(path.join(__dirname, '..', '..'));
    
describe('werelate', function(){
  
  it('works', function(done){
    
    // Loading from a file because it often errored silently
    // in jsdom when loading over http
    var url = 'http://www.werelate.org/wiki/Person:George_Washington_(6)',
        filePath = path.join(__dirname, '..', 'responses', 'werelate', 'washington.html');
    helpers.mockDom(url, filePath, function(){
      genscrape()
      .on('data', function(data){
        expect(data).to.deep.equal({
          givenName: 'President George',
          familyName: 'Washington',
          birthDate: '22 Feb 1732',
          birthPlace: 'Wakefield, Westmoreland, Virginia, United States',
          deathDate: '14 Dec 1799',
          deathPlace: 'Fairfax (independent city), Virginia, United States',
          spouseGivenName: 'Martha',
          spouseFamilyName: 'Dandridge',
          fatherGivenName: 'Captain Augustine',
          fatherFamilyName: 'Washington',
          motherGivenName: 'Mary',
          motherFamilyName: 'Ball'
        });
        done();
      })
    })

  })
  
});