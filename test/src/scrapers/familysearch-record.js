var setupTest = require('../../testHelpers').createTestRunnerWithNock({
  scraperName: 'familysearch-record',
  domain: 'https://www.familysearch.org', 
  testName: function(path, recordId){
    return recordId;
  },
  ajaxPath: function(path, recordId){
    return `${path}${recordId}`;
  },
  windowPath: function(path, recordId){
    return `${path}${recordId}`;
  }
});

describe('familysearch record', function(){
  
  it('process record data', setupPal('MZ87-RG9'));
  
  it('include death and spouse', setupPal('XZLW-29S'));
  
  it('record with no name', setupPal('V8Q1-4LK'));
  
  it('ark', setupArk('MNCT-SDC'));
  
});

/**
 * Sets up a test for a record using a PAL URL
 * 
 * @param {String} recordId
 * @returns {Function} A function(done) that serves as the test method.
 */
function setupPal(recordId){
  return setupTest('/pal:/MM9.1.1/', recordId);
}

/**
 * Sets up a test for a record using an ARK URL
 * 
 * @param {String} recordId
 * @returns {Function} A function(done) that serves as the test method.
 */
function setupArk(recordId){
  return setupTest('/ark:/61903/1:1:', recordId);
}