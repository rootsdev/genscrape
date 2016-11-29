var setupTest = require('../../testHelpers').createTestRunner('findagrave');
    
describe.only('findagrave', function(){
  
  it('Not famous; no family', setupTest(
    'raymond-zierak',
    'http://www.findagrave.com/cgi-bin/fg.cgi?page=gr&GRid=65630115'
  ));
  
  it('Famous; no family', setupTest(
    'patty-duke',
    'http://www.findagrave.com/cgi-bin/fg.cgi?page=gr&GRid=160192994'
  ));
  
  it('Multiple parents; single spouse', setupTest(
    'nancy-reagan',
    'http://www.findagrave.com/cgi-bin/fg.cgi?page=gr&GRid=7657594'
  ));
  
  it('Multiple spouses', setupTest(
    'ronald-reagan',
    'http://www.findagrave.com/cgi-bin/fg.cgi?page=gr&GRid=4244'
  ));
  
  it('sh (random walkthrough) page', setupTest(
    'ronald-reagan-sh',
    'http://www.findagrave.com/cgi-bin/fg.cgi?page=sh&GRid=4244'
  ));
  
  it('Single child', setupTest(
    'kenneth-robbins',
    'http://www.findagrave.com/cgi-bin/fg.cgi?page=gr&GRid=153242774'
  ));
  
  it('Single parent; name suffix', setupTest(
    'thomas-york',
    'http://www.findagrave.com/cgi-bin/fg.cgi?page=gr&GRid=38398001'
  ));
  
  it('Unknown birth; no family', setupTest(
    'boleslaw-barejka',
    'http://www.findagrave.com/cgi-bin/fg.cgi?page=gr&GScid=2140420&GRid=40207050'
  ));
  
  it('Family links with no lifespan', setupTest(
    'robert-coe',
    'http://www.findagrave.com/cgi-bin/fg.cgi?page=gr&GRid=37494703'
  ));
  
  it('period in a family member\'s name', setupTest(
    'alfred-zandell',
    'http://www.findagrave.com/cgi-bin/fg.cgi?page=gr&GRid=53317193'
  ));
  
});