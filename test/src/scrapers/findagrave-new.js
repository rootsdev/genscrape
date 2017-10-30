var setupTest = require('../../testHelpers').createTestRunner('findagrave-new');
    
describe('findagrave - new', function(){
  
  it('Not famous; no family', setupTest(
    'raymond-zierak',
    'https://new.findagrave.com/memorial/65630115'
  ));
  
  it('Famous; no family', setupTest(
    'patty-duke',
    'https://new.findagrave.com/memorial/160192994'
  ));
  
  it('Multiple parents; single spouse', setupTest(
    'nancy-reagan',
    'https://new.findagrave.com/memorial/7657594'
  ));
  
  it('Multiple spouses', setupTest(
    'ronald-reagan',
    'https://new.findagrave.com/memorial/4244'
  ));
  
  it('sh (random walkthrough) page', setupTest(
    'ronald-reagan-sh',
    'https://new.findagrave.com/cemetery/online/4244'
  ));
  
  it('Single child', setupTest(
    'kenneth-robbins',
    'https://new.findagrave.com/memorial/153242774'
  ));
  
  it('Single parent; name suffix', setupTest(
    'thomas-york',
    'https://new.findagrave.com/memorial/38398001'
  ));
  
  it('Unknown birth; no family', setupTest(
    'boleslaw-barejka',
    'https://new.findagrave.com/memorial/40207050'
  ));
  
  it('Family links with no lifespan', setupTest(
    'robert-coe',
    'https://new.findagrave.com/memorial/37494703'
  ));
  
  it('period in a family member\'s name', setupTest(
    'alfred-zandell',
    'https://new.findagrave.com/memorial/53317193'
  ));
  
});