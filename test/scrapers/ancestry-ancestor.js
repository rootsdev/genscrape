var env = require('jsdom').env,
    path = require('path'),
    expect = require('chai').expect,
    genscrape = require(path.join(__dirname, '..', '..'));
    
describe.only('ancestry-ancestor', function(){
  
  it('works', function(done){
    env({
      file: path.join(__dirname, '..', 'responses', 'ancestry', 'tree', '70025770-30322313769.html'),
      url: 'http://trees.ancestry.com/tree/70025770/person/30322313769',
      done: function(errors, window){
        GLOBAL.window = window;
        genscrape()
          .on('data', function(data){
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
      }
    })
  })
  
})