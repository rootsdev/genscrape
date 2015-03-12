var nock = require('nock'),
    path = require('path'),
    expect = require('chai').expect,
    helpers = require('../testHelpers'),
    genscrape = require(path.join(__dirname, '..', '..'));

describe('fs record', function(){
  
  it('process record data', function(done){
    var scope = nock('https://familysearch.org')
      .defaultReplyHeaders({
        'content-type': 'application/json'
      })
      .get('/pal:/MM9.1.1/MZ87-RG9')
      .replyWithFile(200, path.join(__dirname, '..', 'responses', 'fs', 'records', 'MZ87-RG9.json'));
      
    helpers.mockWindow('https://familysearch.org/pal:/MM9.1.1/MZ87-RG9', function(){
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
    });
    
    
  })
  
})