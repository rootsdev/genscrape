var setupTest = require('../../testHelpers').createTestRunner('awm');

describe('awm', function(){

  it('ww2', setupTest(
    'ww2',
    'https://www.awm.gov.au/collection/R1694649'
  ));

  it('ww1-memorial', setupTest(
    'ww1-memorial',
    'https://www.awm.gov.au/collection/R1661477'
  ));

  it('ww1-cemetery', setupTest(
    'ww1-cemetery',
    'https://www.awm.gov.au/collection/R1713831'
  ));

});
