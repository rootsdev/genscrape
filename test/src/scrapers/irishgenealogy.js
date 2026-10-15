var setupTest = require('../../testHelpers').createTestRunner('irishgenealogy');

describe('irishgenealogy', function(){

  it('civil-birth', setupTest(
    'civil-birth',
    'https://www.irishgenealogy.ie/view/?record_id=cibi-10100047'
  ));

  it('civil-death', setupTest(
    'civil-death',
    'https://www.irishgenealogy.ie/view/?record_id=cide-5863758'
  ));

  it('civil-marriage', setupTest(
    'civil-marriage',
    'https://www.irishgenealogy.ie/view/?record_id=cima-2201021'
  ));

  it('baptism', setupTest(
    'baptism',
    'https://www.irishgenealogy.ie/view/?record_id=9d97f322a9-13634'
  ));

  it('baptism-address', setupTest(
    'baptism-address',
    'https://www.irishgenealogy.ie/view/?record_id=bd469535f6-17550'
  ));

  it('marriage', setupTest(
    'marriage',
    'https://www.irishgenealogy.ie/view/?record_id=1dd9f6479b-40055'
  ));

  it('marriage-witnesses', setupTest(
    'marriage-witnesses',
    'https://www.irishgenealogy.ie/view/?record_id=68f3c8a8f2-45824'
  ));

  it('burial', setupTest(
    'burial',
    'https://www.irishgenealogy.ie/view/?record_id=894b618d15-1105'
  ));

});
