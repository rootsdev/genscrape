var expect = require('chai').expect,
    helpers = require('../testHelpers'),
    genscrape = require('../../');

    
describe('main', function(){
  
  it('emit a noMatch event', function(done){
    helpers.mockWindow('http://foobar.com', function(){
      genscrape().on('noMatch', function(){
        expect(true).to.be.true;
        done();
      });
    });
  });
  
});