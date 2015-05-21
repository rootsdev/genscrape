var path = require('path'),
    expect = require('chai').expect,
    helpers = require('../testHelpers'),
    genscrape = require(path.join(__dirname, '..', '..'));
    
describe('billiongraves', function(){
  
  it('name and death', function(done){
    var url = 'http://billiongraves.com/pages/record/LUCINDA-CLARK/216756',
        filePath = path.join(__dirname, '..', 'responses', 'billiongraves', 'Lucinda.html');
    helpers.mockDom(url, filePath, function(){
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
    var url = 'http://billiongraves.com/pages/record/JOSEPH-CLARK/245670',
        filePath = path.join(__dirname, '..', 'responses', 'billiongraves', 'Joseph.html');
    helpers.mockDom(url, filePath, function(){
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