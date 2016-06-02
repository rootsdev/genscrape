var path = require('path'),
    expect = require('chai').expect,
    helpers = require('../../testHelpers'),
    genscrape = require('../../../');
    
describe.skip('ancestry-tree', function(){

  it('works', function(done){
    var url = 'http://trees.ancestry.com/tree/70025770/person/30206952907',
        filePath = path.join(__dirname, '..', 'responses', 'ancestry', 'tree', '70025770-30206952907.html');
    helpers.mockDom(url, filePath, function(){
      genscrape().on('data', function(data){
        expect(data).to.deep.equal({ 
          givenName: 'Theodore',
          familyName: 'Yurkiewicz',
          birthDate: '23 Jun 1892',
          birthPlace: 'Bialykamien, Galizien, Austria',
          deathDate: '22 Oct 1955',
          deathPlace: 'Northampton, Hampshire, Massachusetts, United States',
          fatherGivenName: 'Elias',
          fatherFamilyName: 'Yurkiewicz',
          motherGivenName: 'Xenia',
          motherFamilyName: 'Zuk',
          spouseGivenName: 'Helen Gertrude',
          spouseFamilyName: 'Zierak' 
        });
        done();
      });
    })
  })
  
})