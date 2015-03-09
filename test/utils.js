var utils = require('../src/utils'),
    expect = require('chai').expect;

describe('utils', function(){
  
  it('splitName');
  
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
  
})