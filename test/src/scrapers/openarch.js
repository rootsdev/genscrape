var setupTest = require('../../testHelpers').createTestRunner('openarch');
    
describe('openarch', function(){
  
  it('marriage', setupTest(
    'marriage',
    'https://www.openarch.nl/show.php?archive=ens&identifier=4319e58e-3894-3f18-7a44-dacc65dcf90a'
  ));
  
  it('marriage with birth details', setupTest(
    'marriage-with-birth',
    'https://www.openarch.nl/show.php?archive=rzh&identifier=7a9488e8-91bf-4961-b328-bb30915b9069&lang=en'
  ));
  
  it('baptism', setupTest(
    'baptism',
    'https://www.openarch.nl/show.php?archive=elo&identifier=f0b964b5-2d86-b61e-66b1-fcbd25b9c47c&lang=en'
  ));
  
});