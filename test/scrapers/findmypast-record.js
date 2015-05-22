var path = require('path'),
    expect = require('chai').expect,
    helpers = require('../testHelpers'),
    genscrape = require(path.join(__dirname, '..', '..'));
    
describe.only('findmypast-record', function(){

  it('1920 US census', function(done){
    var url = 'http://search.findmypast.co.uk/record?id=USC/1920/004966622/00929/002&_ga=1.106750979.16848375.1432241988',
        filename = '1920-us-helen-yurkawacz.html';
    test(done, url, filename, { 
      givenName: 'Helen',
      familyName: 'Yurkawacz',
      birthDate: '1889',
      birthPlace: 'Russia',
      spouseGivenName: 'Charles',
      spouseFamilyName: 'Yurkawacz'
    });
  });
  
  it('1930 US census', function(done){
    var url = 'http://search.findmypast.com/record?id=USC/1930/004950335/00976/042&_ga=1.94834460.16848375.1432241988',
        filename = '1930-us-leon-lunderville.html';
    test(done, url, filename, { 
      givenName: 'Leon H',
      familyName: 'Lunderville',
      birthDate: '1896',
      birthPlace: 'Connecticut'
    });
  });
  
  it('Connecticut Deaths', function(done){
    var url = 'http://search.findmypast.ie/record?id=us/bmd/connecti_dea/153071&_ga=1.194846765.16848375.1432241988',
        filename = 'connecticut-deaths-leon-lunderville.html';
    test(done, url, filename, { 
      givenName: 'Leon H',
      familyName: 'Lunderville',
      birthDate: '1895',
      birthPlace: 'Connecticut',
      deathDate: '28 Oct 1956',
      deathPlace: 'Meriden, Connecticut, United States'
    });
  });
  
  it('England Births', function(done){
    var url = 'http://search.findmypast.com.au/record?id=bmd%2fb%2f1857%2f4%2fck%2f000109%2f020',
        filename = 'england-births-charles-davies.html';
    test(done, url, filename, { 
      givenName: 'Charles',
      familyName: 'Davies',
      birthDate: '1857',
      birthPlace: 'Holywell, Flintshire, Wales'
    });
  });
  
  it('Flint Baptisms', function(done){
    var url = 'http://search.findmypast.co.uk/record?id=gbprs%2fb%2f883135177%2f1',
        filename = 'flint-baptisms-charles-davies.html';
    test(done, url, filename, { 
      givenName: 'Charles',
      familyName: 'Davies',
      birthDate: '1863',
      birthPlace: 'Holywell, Flintshire, Wales',
      fatherGivenName: 'John',
      motherGivenName: 'Mary'
    });
  });
  
  it('England Marriages', function(done){
    var url = 'http://search.findmypast.co.uk/record?id=bmd%2fm%2f1873%2f2%2faz%2f000073%2f061',
        filename = 'england-marriages-charles-davies.html';
    test(done, url, filename, { 
      givenName: 'Charles',
      familyName: 'Davies',
      marriageDate: '1873',
      marriagePlace: 'Holywell, Flintshire, Wales'
    });
  });
  
  it('Flint Marriages', function(done){
    var url = 'http://search.findmypast.co.uk/record?id=gbprs%2fm%2f884001280%2f1',
        filename = 'flint-marriages.html';
    test(done, url, filename, { 
      givenName: 'Charles',
      familyName: 'Davies',
      birthDate: '1864',
      marriageDate: '28 Nov 1891',
      marriagePlace: 'Bagillt, Flintshire, Wales',
      spouseGivenName: 'Sarah',
      spouseFamilyName: 'Jones'
    });
  });
  
  it('Flint Banns', function(done){
    var url = 'http://search.findmypast.co.uk/record?id=gbprs%2fm%2f885005529%2f1',
        filename = 'flint-banns.html';
    test(done, url, filename, { 
      givenName: 'Charles',
      familyName: 'Davies',
      marriageDate: '1891',
      marriagePlace: 'Flint, Flintshire, Wales',
      spouseGivenName: 'Sarah',
      spouseFamilyName: 'Jones'
    });
  });
  
});

function test(done, url, fileName, expectedData){
  var filePath = path.join(__dirname, '..', 'responses', 'findmypast', 'records', fileName);
  helpers.mockDom(url, filePath, function(){
    genscrape()
    .on('data', function(actualData){
      expect(actualData).to.deep.equal(expectedData);
      done();
    })
    .on('noData', function(){
      throw new Error('No data');
    });
  });
}