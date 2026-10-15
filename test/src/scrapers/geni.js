var setupTest = require('../../testHelpers').createTestRunner('geni');

describe('geni', function(){

  it('churchill', setupTest(
    'churchill',
    'https://www.geni.com/people/Winston-Churchill/6000000003222187286'
  ));

  it('clementine', setupTest(
    'clementine',
    'https://www.geni.com/people/Clementine-Churchill-Baroness-Spencer-Churchill/6000000003583684153'
  ));

});
