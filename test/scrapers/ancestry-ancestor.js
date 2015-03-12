var path = require('path'),
    expect = require('chai').expect,
    helpers = require('../testHelpers'),
    genscrape = require(path.join(__dirname, '..', '..'));
    
describe('ancestry-ancestor', function(){
  
  it('works', function(done){
    var url = 'http://trees.ancestry.com/tree/70025770/person/30322313769',
        filePath = path.join(__dirname, '..', 'responses', 'ancestry', 'tree', '70025770-30322313769.html');
    helpers.mockDom(url, filePath, function(){
      genscrape().on('data', function(data){
        expect(data).to.deep.equal({ 
          givenName: 'Sophia',
          familyName: 'Gunia',
          birthDate: 'Mar 1890',
          birthPlace: 'Poland Aust',
          fatherGivenName: 'Joseph',
          fatherFamilyName: 'Vannoske',
          motherGivenName: 'Ida',
          spouseGivenName: 'Joseph',
          spouseFamilyName: 'Frederick'
        });
        done();
      });
    })
  })
  
})