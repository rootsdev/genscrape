var setupTest = require('../../testHelpers').createTestRunner('werelate');
    
describe('werelate', function(){
  
  it('male', setupTest(
    'washington',
    'http://www.werelate.org/wiki/Person:George_Washington_%286%29'
  ));
  
  it('female and children', setupTest(
    'mary-ball',
    'http://www.werelate.org/wiki/Person:Mary_Ball_%285%29'
  ));
  
});