var setupTest = require('../../testHelpers').createTestRunner('findagrave');
    
describe('findagrave', function(){
  
  it('Not famous; no family; no www', setupTest(
    'raymond-zierak',
    'https://findagrave.com/cgi-bin/fg.cgi?page=gr&GRid=65630115'
  ));
  
  it('Famous; no family', setupTest(
    'patty-duke',
    'https://www.findagrave.com/cgi-bin/fg.cgi?page=gr&GRid=160192994'
  ));
  
  it('Multiple parents; single spouse', setupTest(
    'nancy-reagan',
    'https://www.findagrave.com/cgi-bin/fg.cgi?page=gr&GRid=7657594'
  ));
  
  it('Multiple spouses', setupTest(
    'ronald-reagan',
    'https://www.findagrave.com/cgi-bin/fg.cgi?page=gr&GRid=4244'
  ));
  
  it('sh (random walkthrough) page', setupTest(
    'ronald-reagan-sh',
    'https://www.findagrave.com/cgi-bin/fg.cgi?page=sh&GRid=4244'
  ));
  
  it('Single child', setupTest(
    'kenneth-robbins',
    'https://www.findagrave.com/cgi-bin/fg.cgi?page=gr&GRid=153242774'
  ));
  
  it('Single parent; name suffix', setupTest(
    'thomas-york',
    'https://www.findagrave.com/cgi-bin/fg.cgi?page=gr&GRid=38398001'
  ));
  
  it('Unknown birth; no family', setupTest(
    'boleslaw-barejka',
    'https://www.findagrave.com/cgi-bin/fg.cgi?page=gr&GScid=2140420&GRid=40207050'
  ));
  
  it('Family links with no lifespan', setupTest(
    'robert-coe',
    'https://www.findagrave.com/cgi-bin/fg.cgi?page=gr&GRid=37494703'
  ));
  
  it('period in a family member\'s name', setupTest(
    'alfred-zandell',
    'https://www.findagrave.com/cgi-bin/fg.cgi?page=gr&GRid=53317193'
  ));
  
});