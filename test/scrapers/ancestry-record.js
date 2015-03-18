var path = require('path'),
    expect = require('chai').expect,
    helpers = require('../testHelpers'),
    genscrape = require(path.join(__dirname, '..', '..'));
    
describe('ancestry-record', function(){

  it('1880 census; parents names', function(done){
    var url = 'http://search.ancestry.com/cgi-bin/sse.dll?db=1880usfedcen&h=2376696&indiv=try&o_vc=Record:OtherRecord&rhSource=7884',
        filePath = path.join(__dirname, '..', 'responses', 'ancestry', 'records', '1880-2376696.html');
    helpers.mockDom(url, filePath, function(){
      genscrape().on('data', function(data){
        expect(data).to.deep.equal({ 
          givenName: 'Frank Van',
          familyName: 'Sky',
          birthDate: '1875',
          birthPlace: 'New York',
          fatherGivenName: 'Joseph Van',
          fatherFamilyName: 'Sky',
          motherGivenName: 'Ida Van',
          motherFamilyName: 'Sky'
        });
        done();
      });
    })
  })
  
  it('vt vitals; marriage info and different parent names', function(done){
    var url = 'http://search.ancestry.com/cgi-bin/sse.dll?db=VTVitalRecs&h=1344848&indiv=try&o_vc=Record:OtherRecord&rhSource=2442',
        filePath = path.join(__dirname, '..', 'responses', 'ancestry', 'records', 'VTVitalRecs-1344848.html');
    helpers.mockDom(url, filePath, function(){
      genscrape().on('data', function(data){
        expect(data).to.deep.equal({ 
          givenName: 'Frank J',
          familyName: 'Vannoske',
          birthDate: '1874',
          birthPlace: 'New York',
          fatherGivenName: 'Joseph',
          fatherFamilyName: 'Vannoske',
          motherGivenName: 'Ida',
          spouseGivenName: 'Anna W',
          spouseFamilyName: 'Atzroth',
          marriageDate: '4 Aug 1900',
          marriagePlace: 'Halifax, Vermont, USA'
        });
        done();
      });
    })
  })
  
  it('ssdi; death date and other birth date', function(done){
    var url = 'http://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=ssdi&h=64142243',
        filePath = path.join(__dirname, '..', 'responses', 'ancestry', 'records', 'ssdi-64142243.html');
    helpers.mockDom(url, filePath, function(){
      genscrape().on('data', function(data){
        expect(data).to.deep.equal({ 
          givenName: 'Clara',
          familyName: 'Vannoske',
          birthDate: '22 Mar 1892',
          deathDate: 'Oct 1974'
        });
        done();
      });
    })
  })
  
  it('findagrave; other death date', function(done){
    var url = 'http://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=findagraveus&h=8824956',
        filePath = path.join(__dirname, '..', 'responses', 'ancestry', 'records', 'findagraveus-8824956.html');
    helpers.mockDom(url, filePath, function(){
      genscrape().on('data', function(data){
        expect(data).to.deep.equal({ 
          givenName: 'Ann',
          familyName: 'Armstrong',
          deathDate: '27 May 1890'
        });
        done();
      });
    })
  })
  
  it('obituary; many relationships', function(done){
    var url = 'http://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=web-obituary&h=22395809',
        filePath = path.join(__dirname, '..', 'responses', 'ancestry', 'records', 'webobituary-22395809.html');
    helpers.mockDom(url, filePath, function(){
      genscrape().on('data', function(data){
        expect(data).to.deep.equal({ 
          givenName: 'Joyce Ann',
          familyName: 'Mears',
          deathDate: '8 Mar 2010',
          deathPlace: 'Seaford',
          spouseGivenName: 'Jerry V.',
          spouseFamilyName: 'Mears',
          fatherGivenName: 'Fred',
          fatherFamilyName: 'Smith',
          motherGivenName: 'Ruth Ellen',
          motherFamilyName: 'Meredith'
        });
        done();
      });
    })
  })
  
  it('no data', function(done){
    var url = 'http://search.ancestry.com/cgi-bin/sse.dll?nodata',
        filePath = path.join(__dirname, '..', 'responses', 'ancestry', 'records', 'nodata.html');
    helpers.mockDom(url, filePath, function(){
      genscrape().on('noData', function(){
        done();
      });
    })
  })
  
})