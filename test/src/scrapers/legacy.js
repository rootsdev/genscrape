var setupTest = require('../../testHelpers').createTestRunner('legacy');

describe('legacy', function(){

  // Given, middle, family name, birth and death dates, death place
  it('full', setupTest(
    'full',
    'https://www.legacy.com/us/obituaries/thestate/name/anne-morris-obituary?id=62316159'
  ));

  // Additional name
  it('middle', setupTest(
    'middle',
    'https://www.legacy.com/us/obituaries/thestate/name/barney-williams-obituary?id=62395602'
  ));

  // No dates
  it('no-dates', setupTest(
    'no-dates',
    'https://www.legacy.com/us/obituaries/thestate/name/baylus-love-obituary?id=62476359'
  ));

});
