var setupTest = require('../../testHelpers').createTestRunner('digitalarkivet');

describe('digitalarkivet', function(){

  // 1910 census; a son in a household
  it('census-child', setupTest(
    'census-child',
    'https://www.digitalarkivet.no/en/census/person/pf01036395003804'
  ));

  // 1910 census; head of household with spouse and children
  it('census-parent', setupTest(
    'census-parent',
    'https://www.digitalarkivet.no/en/census/person/pf01036395003799'
  ));

  // 1910 census; household with several couples so no relationships are inferred
  it('census', setupTest(
    'census',
    'https://www.digitalarkivet.no/en/census/person/pf01036392011143'
  ));

  // Baptism; the child is the person with parents
  it('baptism', setupTest(
    'baptism',
    'https://www.digitalarkivet.no/en/view/255/pd00000002336109'
  ));

  // Baptism; the person is a godparent so no relationships are included
  it('godparent', setupTest(
    'godparent',
    'https://www.digitalarkivet.no/en/view/255/pd00000001628035'
  ));

  // Marriage
  it('marriage', setupTest(
    'marriage',
    'https://www.digitalarkivet.no/en/view/327/pv00000000838891'
  ));

  // Burial
  it('burial', setupTest(
    'burial',
    'https://www.digitalarkivet.no/en/view/267/pg00000003109668'
  ));

});
