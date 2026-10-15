var setupTest = require('../../testHelpers').createTestRunner('familysearch-ancestors-public');

describe('familysearch-ancestors-public', function(){

  it('charlotte', setupTest(
    'charlotte',
    'https://ancestors.familysearch.org/en/LHLL-QFD/charlotte-burnett-1850-1910'
  ));

  it('lee', setupTest(
    'lee',
    'https://ancestors.familysearch.org/en/LWX9-DJD/robert-e-lee-1858-1920'
  ));

});
