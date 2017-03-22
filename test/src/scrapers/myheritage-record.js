var helpers = require('../../testHelpers'),
    genscrape = require('../../../'),
    setupTest = helpers.createTestRunner('myheritage-record');

describe('myheritage-record', function() {
  it('ssdi', setupTest(
    'ssdi-10248383',
    'https://www.myheritage.com/research/record-10002-10248383/stephen-a-zierak-in-us-social-security-death-index-ssdi'
  ));
  it('scotland-births-baptisms', setupTest(
    'scotland-births-baptisms-2401107',
    'https://www.myheritage.com/research/record-30226-2401107-F/issabel-cameron-in-scotland-births-baptisms'
  ));
  it('billiongraves', setupTest(
    'billiongraves-4078167',
    'https://www.myheritage.com/research/record-10147-4078167/anne-h-sarvay-in-billiongraves'
  ));
  it('billiongraves relations', setupTest(
    'billiongraves-52111725',
    'https://www.myheritage.com/research/record-10147-52111725/janet-k-smith-in-billiongraves'
  ));
  it.only('familysearch-family-tree', setupTest(
    'familysearch-family-tree-171359631',
    'https://www.myheritage.com/research/record-40001-171359631/katherine-zierak-in-familysearch-family-tree'
  ));
});
