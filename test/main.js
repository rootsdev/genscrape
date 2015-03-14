var path = require('path'),
    expect = require('chai').expect,
    helpers = require('./testHelpers'),
    genscrape = require(path.join(__dirname, '..'));

    
describe('main', function(){
  
  it('emit a noMatch event', function(done){
    helpers.mockWindow('http://foobar.com', function(){
      genscrape().on('noMatch', function(){
        expect(true).to.be.true;
        done();
      })
    });
  })
  
})