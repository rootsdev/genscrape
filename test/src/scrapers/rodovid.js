var setupTest = require('../../testHelpers').createTestRunner('rodovid');

describe('rodovid', function(){

  it('hohenlohe', setupTest(
    'hohenlohe',
    'https://en.rodovid.org/wk/Person:50000'
  ));

  it('bates', setupTest(
    'bates',
    'https://ru.rodovid.org/wk/Person:30000'
  ));

});
