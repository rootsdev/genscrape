var setupTest = require('../../testHelpers').createTestRunnerWithNock({
  scraperName: 'ancestry-person',
  domain: 'https://www.ancestry.com', 
  testName: function(treeId, personId){
    return `${treeId}-${personId}`;
  },
  ajaxPath: function(treeId, personId){
    return `/family-tree/person/tree/${treeId}/person/${personId}/content/factsbody`;
  },
  windowPath: function(treeId, personId){
    return `/family-tree/person/tree/${treeId}/person/${personId}`;
  }
});

describe('ancestry person', function(){

  it('basic', setupTest('70025770', '30206952907'));
  
  it('no facts', setupTest('70025770', '30206952948'));

  it('missing spouse', setupTest('70025770', '30206952953'));
  
  it('missing parents', setupTest('70025770', '30206952959'));
  
  it('child of unknown spouse; marriage event not associated with a spouse', setupTest('75549', '110053435746'));
  
  it('multiple spouses');
  
});