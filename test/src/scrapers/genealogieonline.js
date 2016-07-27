var setupTest = require('../../testHelpers').createTestRunner('genealogieonline');
    
describe.only('genealogieonline', function(){
  
  it('simple', setupTest(
    'simple',
    'https://www.genealogieonline.nl/en/voorouders-monique-en-jan-vis/I15210.php'
  ));
  
  it('child', setupTest(
    'child',
    'https://www.genealogieonline.nl/en/voorouders-monique-en-jan-vis/I39364.php'
  ));
  
  it('children', setupTest(
    'children',
    'https://www.genealogieonline.nl/en/voorouders-monique-en-jan-vis/I39356.php'
  ));
  
  // There is no schema.org markup for grandparents. This is mostly to make sure
  // it doesn't intefere with parsing
  it('grandparents', setupTest(
    'grandparents',
    'https://www.genealogieonline.nl/en/voorouders-monique-en-jan-vis/I39388.php'
  ));
  
});