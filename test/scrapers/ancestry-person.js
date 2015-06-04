var nock = require('nock'),
    path = require('path'),
    expect = require('chai').expect,
    helpers = require('../testHelpers'),
    genscrape = require(path.join(__dirname, '..', '..'));

describe.only('ancestry person', function(){
  
  nockSetup('70025770', '30206952907');
  
  it('basic', function(done){
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