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
  it('familysearch-family-tree', setupTest(
    'familysearch-family-tree-171359631',
    'https://www.myheritage.com/research/record-40001-171359631/katherine-zierak-in-familysearch-family-tree'
  ));
  it('united-states-federal-census-tree', setupTest(
    'united-states-federal-census-90714854',
    'https://www.myheritage.com/research/record-10053-90714854/helen-g-yurkiewicz-in-1940-united-states-federal-census'
  ));
  it('united-states-federal-census-tree', setupTest(
    'united-states-federal-census-113306106',
    'https://www.myheritage.com/research/record-10133-113306106/grace-t-kiefer-in-1920-united-states-federal-census'
  ));
  it('germany-bremen-passenger-departure-lists', setupTest(
    'germany-bremen-passenger-departure-lists-12326',
    'https://www.myheritage.com/research/record-30240-12326/mopsche-turner-in-germany-bremen-passenger-departure-lists'
  ));
});
