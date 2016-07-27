var setupTest = require('../../testHelpers').createTestRunner('genealogieonline');
    
describe.only('genealogieonline', function(){
  
  it('simple', setupTest(
    'I15210',
    'https://www.genealogieonline.nl/en/voorouders-monique-en-jan-vis/I15210.php'
  ));
  
});