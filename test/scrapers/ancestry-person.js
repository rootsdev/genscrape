var nock = require('nock'),
    path = require('path'),
    expect = require('chai').expect,
    helpers = require('../testHelpers'),
    genscrape = require(path.join(__dirname, '..', '..'));

describe('ancestry person', function(){

  it('basic', function(done){
    nockSetup('70025770', '30206952907');
    helpers.mockWindow('http://person.ancestry.com/tree/70025770/person/30206952907', function(){
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
    });
  });
  
  it('missing parents', function(done){
    nockSetup('70025770', '30206952926');
    helpers.mockWindow('http://person.ancestry.com/tree/70025770/person/30206952926', function(){
      genscrape().on('data', function(data){
        expect(data).to.deep.equal({ 
          givenName: 'Catharina',
          familyName: 'Czosnikoska',
          fatherGivenName: 'Joannes',
          fatherFamilyName: 'Czosnikoska',
          motherGivenName: 'Xenia',
          spouseGivenName: 'Joannes',
          spouseFamilyName: 'Jurkiewicz'
        });
        done();
      });
    });
  });
  
  it('missing parents', function(done){
    nockSetup('70025770', '30206952959');
    helpers.mockWindow('http://person.ancestry.com/tree/70025770/person/30206952959', function(){
      genscrape().on('data', function(data){
        expect(data).to.deep.equal({ 
          givenName: 'Elia',
          familyName: 'Jurkiewicz',
          spouseGivenName: 'Maria'
        });
        done();
      });
    });
  });

  it('missing spouse', function(done){
    nockSetup('70025770', '30206952953');
    helpers.mockWindow('http://person.ancestry.com/tree/70025770/person/30206952953', function(){
      genscrape().on('data', function(data){
        expect(data).to.deep.equal({ 
          givenName: 'Cirillus',
          familyName: 'Jurkiewicz',
          birthDate: '24 Feb 1848',
          birthPlace: 'Bialykamien, Galizien, Austria',
          deathDate: '23 Aug 1848',
          deathPlace: 'Bialykamien, Galizien, Austria',
          fatherGivenName: 'Joannes',
          fatherFamilyName: 'Jurkiewicz',
          motherGivenName: 'Catharina',
          motherFamilyName: 'Czosnikoska'
        });
        done();
      });
    });
  });
  
});

/**
 * Configure nock to respond properly to requests
 * for the given person with test data
 */
function nockSetup(treeId, personId){
  nock('http://person.ancestry.com')
    .defaultReplyHeaders({
      'content-type': 'application/json'
    })
    .get('/tree/' + treeId + '/person/' + personId + '/content/factsbody')
    .replyWithFile(200, path.join(__dirname, '..', 'responses', 'ancestry', 'person', treeId + '-' + personId + '.json'));
}