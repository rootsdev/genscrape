var setupTest = require('../../testHelpers').createTestRunnerWithNock({
  scraperName: 'ancestry-person',
  domain: 'http://person.ancestry.com', 
  testName: function(treeId, personId){
    return `${treeId}-${personId}`;
  },
  ajaxPath: function(treeId, personId){
    return `/tree/${treeId}/person/${personId}/content/factsbody`;
  },
  windowPath: function(treeId, personId){
    return `/tree/${treeId}/person/${personId}`;
  }
});

describe.only('ancestry person', function(){

  it('basic', setupTest('70025770', '30206952907'));
  
  it('no facts', setupTest('70025770', '30206952926'));
  
  it('missing parents', setupTest('70025770', '30206952959'));

  it('missing spouse', setupTest('70025770', '30206952953'));
  
  it('multiple spouses');
  
  it('child of unknown spouse');
  
});