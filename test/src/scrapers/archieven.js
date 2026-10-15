var setupTest = require('../../testHelpers').createTestRunner('archieven');

// The fixtures are the DOM after the record details were loaded by AJAX
describe('archieven', function(){

  it('birth', setupTest(
    'birth',
    'https://www.archieven.nl/nl/zoeken?mivast=0&mizig=310&miadt=236&miaet=54&micode=358.46-11882&minr=9459325&miview=ldt'
  ));

  it('death', setupTest(
    'death',
    'https://www.archieven.nl/nl/zoeken?mivast=0&mizig=310&miadt=236&miaet=54&micode=358.46-31886&minr=35717082&miview=ldt'
  ));

  it('marriage', setupTest(
    'marriage',
    'https://www.archieven.nl/nl/zoeken?mivast=0&mizig=310&miadt=236&miaet=54&micode=358.6-3731&minr=44521711&miview=ldt'
  ));

});
