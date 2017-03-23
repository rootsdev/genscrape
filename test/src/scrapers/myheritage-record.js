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
  it('mexico-baptisms', setupTest(
    'mexico-baptisms-1799709',
    'https://www.myheritage.com/research/record-30039-1799709-F/j-ysac-gonzalez-in-mexico-baptisms'
  ));
  it('california-county-marriages', setupTest(
    'california-county-marriages-1399039',
    'https://www.myheritage.com/research/record-30244-1399039/charles-e-york-and-frances-m-osborn-in-california-county-marriages'
  ));
  it('germany-marriages', setupTest(
    'germany-marriages-1968627-F',
    'https://www.myheritage.com/research/record-30038-1968627-F/jacobine-friederike-van-der-horst-and-heinrich-kuckes-in-germany-marriages'
  ));
  it('spain-marriages', setupTest(
    'spain-marriages-1934741-F',
    'https://www.myheritage.com/research/record-30057-1934741-F/cecilia-alabori-pujeu-and-juan-clota-y-clota-in-spain-marriages'
  ));
  it('massachusetts-marriages', setupTest(
    'massachusetts-marriages-1113561',
    'https://www.myheritage.com/research/record-30033-1113561/henry-leroy-york-and-elevia-belle-harriman-in-massachusetts-marriages'
  ));
  it('denmark-census', setupTest(
    'denmark-census-2434583',
    'https://www.myheritage.com/research/record-10181-2434583/terry-andersen-in-1930-denmark-census'
  ));
  it('england-wales-census', setupTest(
    'england-wales-census-101511824',
    'https://www.myheritage.com/research/record-10156-101511824/samuel-jeremy-in-1901-england-wales-census'
  ));
  it('united-states-federal-census', setupTest(
    'united-states-federal-census-41588411',
    'https://www.myheritage.com/research/record-10128-41588411/martha-snark-in-1870-united-states-federal-census'
  ));
  it('united-states-federal-census', setupTest(
    'united-states-federal-census-53702700',
    'https://www.myheritage.com/research/record-10132-53702700/john-s-townsend-in-1910-united-states-federal-census'
  ));
});
