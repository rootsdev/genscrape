var path = require('path'),
    expect = require('chai').expect,
    helpers = require('../testHelpers'),
    genscrape = require(path.join(__dirname, '..', '..'));
    
describe('openarch', function(){
  
  it('simple', function(done){
    
    // Loading from a file because it often errored silently
    // in jsdom when loading over http
    var url = 'https://www.openarch.nl/show.php?archive=ens&identifier=4319e58e-3894-3f18-7a44-dacc65dcf90a',
        filePath = path.join(__dirname, '..', 'responses', 'openarch', 'albertus.html');
    helpers.mockDom(url, filePath, function(){
      genscrape()
      .on('data', function(data){
        expect(data).to.deep.equal({
          givenName: 'Albertus Henderikus',
          familyName: 'Kleinenberg',
          spouseGivenName: 'Janna',
          spouseFamilyName: 'Moes',
          fatherGivenName: 'Albert Kasper',
          fatherFamilyName: 'Kleinenberg',
          motherGivenName: 'Dieuwkje',
          motherFamilyName: 'Bosma'
        });
        done();
      })
    })

  })
  
});