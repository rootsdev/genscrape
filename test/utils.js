var utils = require('../src/utils'),
    expect = require('chai').expect;

describe('utils', function(){
  
  describe('splitName', function(){
    
    it('returns two empty strings when name is falsey', function(){
      expect(utils.splitName()).to.deep.equal(['','']);
      expect(utils.splitName(null)).to.deep.equal(['','']);
      expect(utils.splitName(false)).to.deep.equal(['','']);
      expect(utils.splitName('')).to.deep.equal(['','']);
    })
    
    it('splits the name', function(){
      expect(utils.splitName('Foo Bar')).to.deep.equal(['Foo','Bar']);
      expect(utils.splitName('One')).to.deep.equal(['One']);
      expect(utils.splitName('one two three')).to.deep.equal(['one two','three']);
    })
    
  });
  
  it('urlPatternToRegex', function(){
    var regex = utils.urlPatternToRegex('https://familysearch.org/pal:/MM9.1.1/*');
    expect(regex.source).to.equal('https:\/\/familysearch\.org\/pal:\/MM9\.1\.1\/.*');
    expect(regex.test('https://familysearch.org/pal:/MM9.1.1/MZ87-RG9')).to.be.true;
    expect(regex.test('https://familysearch.org/pal:/MM9.1.1/M47-RG9')).to.be.true;
    expect(regex.test('https://familysearch.org/pal/MM9.1.1/M47-RG9')).to.not.be.true;
  })
  
  it('getHashParts', function(){
    GLOBAL.window = {
      location: {
        hash: '#foo=bar&top=done'
      }
    };
    expect(utils.getHashParts()).to.deep.equal({
      foo: 'bar',
      top: 'done'
    });
  })
  
  describe('getQueryParams', function(){
    
    it('no query string', function(){
      GLOBAL.window = {
        location: {
          search: ''
        }
      };
      expect(utils.getQueryParams()).to.deep.equal({});
    });
    
    it('params', function(){
      GLOBAL.window = {
        location: {
          search: '?foo=bar&fizz=buzz'
        }
      };
      expect(utils.getQueryParams()).to.deep.equal({
        foo: 'bar',
        fizz: 'buzz'
      });
    });
    
    it('duplicate params', function(){
      GLOBAL.window = {
        location: {
          search: '?foo=bar&foo=buzz'
        }
      };
      expect(utils.getQueryParams()).to.deep.equal({
        foo: 'buzz'
      });
    });
    
  })
  
})