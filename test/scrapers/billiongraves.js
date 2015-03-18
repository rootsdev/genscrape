var nock = require('nock'),
    path = require('path'),
    expect = require('chai').expect,
    helpers = require('../testHelpers'),
    genscrape = require(path.join(__dirname, '..', '..'));
    
describe('billiongraves', function(){
  
  this.timeout(5000);
  
  before(function(){
    nock.enableNetConnect('billiongraves.com');
  });
  
  it('name and death', function(done){
    helpers.realWindow('http://billiongraves.com/pages/record/LUCINDA-CLARK/216756', function(){
      genscrape()
      .on('data', function(data){
        expect(data).to.deep.equal({ 
          givenName: 'Lucinda',
          familyName: 'Clark',
          deathDate: '9 June 1900' 
        });
        done();
      })
    });
  })
  
  it('include birth', function(done){
    helpers.realWindow('http://billiongraves.com/pages/record/JOSEPH-CLARK/245670', function(){
      genscrape()
      .on('data', function(data){
        expect(data).to.deep.equal({
          givenName: 'Joseph',
          familyName: 'Clark',
          birthDate: '7 October 1798',
          deathDate: '25 October 1866'
        });
        done();
      })
    })
    
  })
  
})