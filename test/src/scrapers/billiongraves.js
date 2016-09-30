var setupTest = require('../../testHelpers').createTestRunner('billiongraves');
    
describe.only('billiongraves', function(){
  
  it('name and death', setupTest(
    'Lucinda',
    'http://billiongraves.com/grave/LUCINDA-CLARK/216756'
  ));
  
  it('include birth', setupTest(
    'Joseph',
    'http://billiongraves.com/grave/JOSEPH-CLARK/245670'
  ));
  
});