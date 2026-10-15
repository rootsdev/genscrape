var setupTest = require('../../testHelpers').createTestRunner('fold3-memorial');

describe('fold3-memorial', function(){

  it('missing', setupTest(
    'missing',
    'https://www.fold3.com/memorial/529885239/alfred-r-ellis'
  ));

  it('buried', setupTest(
    'buried',
    'https://www.fold3.com/memorial/529923576/ernest-r-ackerman'
  ));

  it('celebrity', setupTest(
    'celebrity',
    'https://www.fold3.com/memorial/630019169/sammy-davis-jr'
  ));

});
