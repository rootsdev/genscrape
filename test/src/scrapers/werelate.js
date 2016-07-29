var setupTest = require('../../testHelpers').createTestRunner('werelate');
    
describe.only('werelate', function(){
  
  it('simple', setupTest(
    'washington',
    'http://www.werelate.org/wiki/Person:George_Washington_(6)'
  ));
  
});