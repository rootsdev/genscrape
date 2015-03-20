var nock = require('nock'),
    path = require('path'),
    expect = require('chai').expect,
    helpers = require('../testHelpers'),
    genscrape = require(path.join(__dirname, '..', '..'));
    
describe('genealogieonline', function(){
  
  this.timeout(10000);
  
  before(function(){
    nock.enableNetConnect('genealogieonline.nl:443');
  });
  
  it('simple', function(done){
    helpers.realWindow('https://www.genealogieonline.nl/en/voorouders-monique-en-jan-vis/I15210.php', function(){
      genscrape()
      .on('data', function(data){
        expect(data).to.deep.equal({ 
          givenName: 'Pieter',
          familyName: 'den Herder',
          birthDate: '1844-12-21',
          deathDate: '1924-04-04',
          spouseGivenName: 'Jannetje',
          spouseFamilyName: 'Mieras',
          marriageDate: '1872-11-21',
          fatherGivenName: 'Daniel Willem',
          fatherFamilyName: 'den Herder',
          motherGivenName: 'Catharina',
          motherFamilyName: 'Thorenaar' 
        });
        done();
      })
    });
  })
  
});