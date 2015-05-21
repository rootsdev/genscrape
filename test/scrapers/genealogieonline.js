var path = require('path'),
    expect = require('chai').expect,
    helpers = require('../testHelpers'),
    genscrape = require(path.join(__dirname, '..', '..'));
    
describe('genealogieonline', function(){
  
  it('simple', function(done){
    var url = 'https://www.genealogieonline.nl/en/voorouders-monique-en-jan-vis/I15210.php',
        filePath = path.join(__dirname, '..', 'responses', 'genealogieonline', 'I15210.html');
    helpers.mockDom(url, filePath, function(){
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