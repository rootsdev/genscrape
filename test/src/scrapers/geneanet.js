var setupTest = require('../../testHelpers').createTestRunner('geneanet');

describe('geneanet', function(){

  it('washington', setupTest(
    'washington',
    'https://gw.geneanet.org/pierfit?lang=en&n=washington&p=george'
  ));

  it('dandridge', setupTest(
    'dandridge',
    'https://gw.geneanet.org/pierfit?lang=en&n=dandridge&p=martha'
  ));

});
