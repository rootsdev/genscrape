var setupTest = require('../../testHelpers').createTestRunner('abmc');

describe('abmc', function(){

  it('bellows', setupTest(
    'bellows',
    'https://www.abmc.gov/profile/private-first-class-william-h-bellows/'
  ));

  it('yldefonzo', setupTest(
    'yldefonzo',
    'https://www.abmc.gov/profile/sergeant-teofilo-yldefonzo/'
  ));

  it('blankenship', setupTest(
    'blankenship',
    'https://www.abmc.gov/profile/sergeant-harry-blankenship/'
  ));

});
