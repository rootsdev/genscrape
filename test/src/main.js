var expect = require('chai').expect,
    path = require('path'),
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
  
  it('fall back to the generic extractor on unsupported sites', function(done){
    var file = path.join(__dirname, '..', 'data', 'generic', 'record.html');
    helpers.mockDom('http://parish.example.com/burials/1234', file, function(){
      genscrape().on('data', function(gedx, meta){
        expect(meta.generic).to.be.true;
        var person = gedx.getPersons().filter(function(p){ return p.getPrincipal(); })[0];
        expect(person.getNames()[0].getNameForms()[0].getFullText()).to.equal('Thomas Example');
        var burial = person.getFacts().filter(function(f){ return /Burial$/.test(f.getType()); })[0];
        expect(burial.getDate().getOriginal()).to.equal('14 March 1842');
        expect(burial.getPlace().getOriginal()).to.contain('Sampleton');
        done();
      }).on('noMatch', function(){
        done(new Error('expected generic data'));
      });
    });
  });
  
  it('emit noMatch when generic is disabled', function(done){
    var file = path.join(__dirname, '..', 'data', 'generic', 'record.html');
    helpers.mockDom('http://parish.example.com/burials/1234', file, function(){
      genscrape({ generic: false }).on('noMatch', function(){
        done();
      });
    });
  });
  
});
