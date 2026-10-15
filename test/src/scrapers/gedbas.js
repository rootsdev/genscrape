var setupTest = require('../../testHelpers').createTestRunner('gedbas');

describe('gedbas', function(){

  // Parents, spouse with marriage, children, characteristics, events
  it('friedrich', setupTest(
    'friedrich',
    'https://gedbas.genealogy.net/person/show/1331881715'
  ));

  // Spouse without marriage data
  it('theophil', setupTest(
    'theophil',
    'https://gedbas.genealogy.net/person/show/1331881706'
  ));

});
