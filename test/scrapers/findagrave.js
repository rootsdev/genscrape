var nock = require('nock'),
    path = require('path'),
    expect = require('chai').expect,
    helpers = require('../testHelpers'),
    genscrape = require(path.join(__dirname, '..', '..'));
    
describe('findagrave', function(){
  
  this.timeout(10000);
  
  before(function(){
    nock.enableNetConnect('findagrave.com');
  });
  
  it('simple', function(done){
    helpers.realWindow('http://www.findagrave.com/cgi-bin/fg.cgi?page=gr&GRid=27336072', function(){
      genscrape()
      .on('data', function(data){
        expect(data).to.deep.equal({ 
          givenName: 'Paul',
          familyName: 'Clark',
          birthDate: 'Dec. 16,  1948',
          deathDate: 'Jul. 23,  2000' 
        });
        done();
      })
    });
  })
  
});