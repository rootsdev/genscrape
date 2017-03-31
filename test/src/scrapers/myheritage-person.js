var setupTest = require('../../testHelpers').createTestRunnerWithNock({
  scraperName: 'myheritage-person',
  domain: 'https://www.myheritage.com',
  testName: function(treeId, personId, page){
    return `${treeId}-${personId}-${page}`;
  },
  ajaxPaths: [
    // Main Page
    function(treeId, personId) {
      return {
        path: `/FP/API/Profile/get-profile-tab-content.php?s=${treeId}&siteID=${treeId}&indID=${personId}&show=info&inCanvas=1&getPart=main`,
        file: `${treeId}-${personId}-page.html`,
        type: 'text/html'
      }
    },
    // Event Tab
    function(treeId, personId) {
      return {
        path: `/FP/API/Profile/get-profile-tab-content.php?s=${treeId}&siteID=${treeId}&indID=${personId}&show=events&inCanvas=0&getPart=tab`,
        file: `${treeId}-${personId}-events.html`,
        type: 'text/html'
      }
    }
  ],
  windowPath: function(treeId, personId, page){
    if (page === 'person') {
      return `/person-${personId}_${treeId}_${treeId}/the-persons-name`;
    } else {
      return `/site-family-tree-${treeId}/york-web-site-rootstech#!profile-${personId}-info`;
    }
  }
});

describe('myheritage person', function(){

  it('basic person', setupTest('209005991', '2000081', 'person'));

  it('basic site', setupTest('209005991', '2000081', 'page'));

  it('immediate family person', setupTest('209005991', '2000004', 'person'));

  it('immediate family site', setupTest('209005991', '2000004', 'page'));
});
