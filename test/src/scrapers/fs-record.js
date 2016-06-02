var nock = require('nock'),
    path = require('path'),
    expect = require('chai').expect,
    helpers = require('../../testHelpers'),
    genscrape = require('../../../');

describe.skip('fs record', function(){
  
  it('process record data', function(done){
    nockSetupPal('MZ87-RG9');
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
  
  it('include death and spouse', function(done){
    nockSetupPal('XZLW-29S');
    helpers.mockWindow('https://familysearch.org/pal:/MM9.1.1/XZLW-29S', function(){
      genscrape().on('data', function(data){
        expect(data).to.deep.equal({ 
          givenName: 'Lemuel Sturdevant',
          familyName: 'Leavitt',
          deathDate: '1946',
          deathPlace: 'St George, Washington, Utah, United States',
          spouseGivenName: 'Susan J.',
          spouseFamilyName: 'Leavitt',
          motherGivenName: 'Elatheir',
          motherFamilyName: 'Bunker',
          fatherGivenName: 'Edward Washington',
          fatherFamilyName: 'Leavitt'
        });
        done();
      })
    });
  })
  
  it('record with no name', function(done){
    nockSetupPal('V8Q1-4LK');
    helpers.mockWindow('https://familysearch.org/pal:/MM9.1.1/V8Q1-4LK', function(){
      genscrape().on('data', function(data){
        expect(data).to.deep.equal({ 
          givenName: undefined,
          familyName: undefined,
          birthDate: '09 Jul 1904',
          birthPlace: 'Erath, Texas',
          motherGivenName: 'I N',
          motherFamilyName: 'Sligar'
        });
        done();
      })
    });
  })
  
  it('processFSNameParts', function(done){
    nockSetupArk('MNCT-SDC');
    helpers.mockWindow('https://familysearch.org/ark:/61903/1:1:MNCT-SDC', function(){
      genscrape().on('data', function(data){
        expect(data).to.deep.equal({ 
          givenName: 'Thomas',
          familyName: 'Turner',
          birthDate: '1830-1831',
          birthPlace: 'England'
        });
        done();
      })
    });
  })
  
})

function nockSetupPal(recordId){
  scope = nock('https://familysearch.org')
    .defaultReplyHeaders({
      'content-type': 'application/json'
    })
    .get('/pal:/MM9.1.1/'+recordId)
    .replyWithFile(200, path.join(__dirname, '..', 'responses', 'fs', 'records', recordId+'.json'));
}

function nockSetupArk(recordId){
  scope = nock('https://familysearch.org')
    .defaultReplyHeaders({
      'content-type': 'application/json'
    })
    .get('/ark:/61903/1:1:'+recordId)
    .replyWithFile(200, path.join(__dirname, '..', 'responses', 'fs', 'records', recordId+'.json'));
}