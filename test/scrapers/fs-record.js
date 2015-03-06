var nock = require('nock'),
    path = require('path'),
    expect = require('chai').expect,
    genscrape = require(path.join(__dirname, '..', '..'));

describe('fs record', function(){
  
  it('first test', function(done){
    var scope = nock('https://familysearch.org')
      .defaultReplyHeaders({
        'content-type': 'application/json'
      })
      .get('/pal:/MM9.1.1/MZ87-RG9')
      .replyWithFile(200, path.join(__dirname, '..', 'responses', 'fs', 'records', 'MZ87-RG9.json'));
      
    GLOBAL.window = {
      location: {
        href: 'https://familysearch.org/pal:/MM9.1.1/MZ87-RG9'
      }
    };
    
    genscrape().on('data', function(data){
      expect(data).to.deep.equal({ 
        givenName: 'Frank Van',
        familyName: 'Sky',
        birthDate: '1875',
        birthPlace: 'NY',
        motherGivenName: 'Ida Van',
        motherFamilyName: 'Sky',
        fatherGivenName: 'Joseph Van',
        fatherFamilyName: 'Sky'
      });
      done();
    })
  })
  
})