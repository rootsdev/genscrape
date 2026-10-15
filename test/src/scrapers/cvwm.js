var setupTest = require('../../testHelpers').createTestRunner('cvwm');

describe('cvwm', function(){

  it('signalman', setupTest(
    'signalman',
    'https://www.veterans.gc.ca/eng/remembrance/memorials/canadian-virtual-war-memorial/detail/2659509'
  ));

  it('parents-spouse', setupTest(
    'parents-spouse',
    'https://veterans.gc.ca/en/remembrance/memorials/canadian-virtual-war-memorial/detail/316485'
  ));

  it('minimal', setupTest(
    'minimal',
    'https://www.veterans.gc.ca/eng/remembrance/memorials/canadian-virtual-war-memorial/detail/1577024'
  ));

  it('airman', setupTest(
    'airman',
    'https://www.veterans.gc.ca/eng/remembrance/memorials/canadian-virtual-war-memorial/detail/2967727'
  ));

});
