var setupTest = require('../../testHelpers').createTestRunner('freecen');

describe('freecen', function(){

  // 1871 census, includes relationship to head and marital status
  it('1871', setupTest(
    '1871',
    'https://www.freecen.org.uk/search_records/590507f9e9379091b11264db/elizabeth-edwards-1871-sussex-brighton-1813-?locale=en'
  ));

  // 1841 census has fewer columns
  it('1841', setupTest(
    '1841',
    'https://www.freecen.org.uk/search_records/5a154a3df4040b9d6e5c3b09'
  ));

});
