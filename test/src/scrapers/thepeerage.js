var setupTest = require('../../testHelpers').createTestRunner('thepeerage');

describe('thepeerage', function(){

  // p10.htm: John Singleton Copley, 1st Baron Lyndhurst
  it('lyndhurst', setupTest(
    'lyndhurst',
    'https://www.thepeerage.com/p10.htm#i91'
  ));

  // p1000.htm: Lady Susanna Stewart
  it('susanna', setupTest(
    'susanna',
    'https://www.thepeerage.com/p1000.htm#i9991'
  ));

  // p1000.htm: Granville Leveson-Gower, 1st Earl Granville (not the first person on the page)
  it('granville', setupTest(
    'granville',
    'https://www.thepeerage.com/p1000.htm#i9992'
  ));

  // No hash: first person on the page is the principal
  it('no-hash', setupTest(
    'no-hash',
    'https://www.thepeerage.com/p1000.htm'
  ));

});
