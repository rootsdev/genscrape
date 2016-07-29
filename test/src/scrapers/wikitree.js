var setupTest = require('../../testHelpers').createTestRunner('wikitree');

describe('wikitree', function(){

    it('basic male', setupTest(
        'Theodore Roosevelt Jr',
        'http://www.wikitree.com/wiki/Roosevelt-18'
    ));

    it('basic female', setupTest(
        'Alice Roosevelt',
        'http://www.wikitree.com/wiki/Lee-16'
    ));
    
    it('basic nickname', setupTest(
        'Edward M Salty Smith',
        'http://www.wikitree.com/wiki/Smith-9130'
    ));
    
    it('Much missing information and year of birth', setupTest(
        'Edward Smith',
        'http://www.wikitree.com/wiki/Smith-19124'
    ));

});
