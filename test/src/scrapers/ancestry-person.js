var nock = require('nock'),
    helpers = require('../../testHelpers'),
    genscrape = require('../../../'),
    debug = require('debug')('genscrape:tests:ancestry-person'),
    pagesDir = __dirname + '/../../data/ancestry/person/pages',
    outputDir = __dirname + '/../../data/ancestry/person/output';

describe('ancestry person', function(){

  this.timeout(10000);

  it.only('basic', setupTest('70025770', '30206952907'));

  /*
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
  */
  
  it('multiple spouses');
  
  it('child of unknown spouse');
  
});

/**
 * Setup a ancestry person test
 * 
 * @param {String} treeId
 * @param {String} personId
 * @returns {Function} - The actual test method that mocha will run
 */
function setupTest(treeId, personId){
  debug(`setup ${treeId}:${personId}`);
  
  var inputFile = `${pagesDir}/${treeId}-${personId}.json`,
      outputFile = `${outputDir}/${treeId}-${personId}.json`;
  
  // Setup nock to respond to the AJAX request that will be made by the scraper
  nock('http://person.ancestry.com')
    .defaultReplyHeaders({
      'content-type': 'application/json'
    })
    .get(`/tree/${treeId}/person/${personId}/content/factsbody`)
    .replyWithFile(200, inputFile);
    
  // Create and return the actual test method  
  return function(done){
    debug(`test ${treeId}:${personId}`);
    
    // Setup a mock browser window
    helpers.mockWindow(`http://person.ancestry.com/tree/${treeId}/person/${personId}`, function(){
      debug('window setup');
      
      // Run genscrape
      genscrape().on('data', function(data){
        
        // Test
        done(helpers.compareOrRecordOutput(data, outputFile));
      }).on('error', done);
    });
  };
}