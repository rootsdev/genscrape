var setupTest = require('../../testHelpers').createTestRunner('freereg');

describe('freereg', function(){

  it('baptism', setupTest(
    'baptism',
    'https://www.freereg.org.uk/search_records/5e29f296f493fd5a052f7a98'
  ));

  it('baptism-mother', setupTest(
    'baptism-mother',
    'https://www.freereg.org.uk/search_records/684debd986557455d495af6d'
  ));

  it('baptism-abode', setupTest(
    'baptism-abode',
    'https://www.freereg.org.uk/search_records/5f1f2026f493fd49434bd3f4'
  ));

  it('marriage', setupTest(
    'marriage',
    'https://www.freereg.org.uk/search_records/60521934f493fdd7899f1ac3'
  ));

  it('marriage-witnesses', setupTest(
    'marriage-witnesses',
    'https://www.freereg.org.uk/search_records/5efcaab2f493fd0e2cab038a'
  ));

  it('burial', setupTest(
    'burial',
    'https://www.freereg.org.uk/search_records/6838192286557439c2378a35'
  ));

});
