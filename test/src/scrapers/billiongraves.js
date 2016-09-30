var setupTest = require('../../testHelpers').createTestRunner('billiongraves');
    
describe('billiongraves', function(){
  
  it('name and death', setupTest(
    'Lucinda',
    'https://billiongraves.com/grave/LUCINDA-CLARK/216756'
  ));
  
  it('include birth', setupTest(
    'Joseph',
    'https://billiongraves.com/grave/JOSEPH-CLARK/245670'
  ));
  
});