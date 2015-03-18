var debug = require('debug')('findagrave'),
    utils = require('../utils');

var urls = [
  utils.urlPatternToRegex("http://www.findagrave.com/cgi-bin/fg.cgi*")
];

module.exports = function(register){
  register(urls, function(emitter){
    if( utils.getQueryParams()['page'] == 'gr' ) {
      run(emitter);
    } else {
      emitter.emit('noMatch');
    }
  });
};

function run(emitter){
  debug('run');
  
  var nameParts = utils.splitName( $('.plus2').text() );
  var personData = {
    'givenName': nameParts[0],
    'familyName': nameParts[1]
  };
  
  // We're doing an xpath query to get the birth and death
  // because findagrave has illegal HTML that
  // causes errors when traversing the DOM via jQuery.
  // The information may be in two different places depending 
  // on whether the "sponsor memorial" banner is present
  var document = window.document; // So it works during testing
  var XPathResult = window.XPathResult;
  
  var birth1 = document.evaluate('/html/body/table/tbody/tr/td[3]/table/tbody/tr[3]/td[1]/table/tbody/tr/td/table/tbody/tr/td/table/tbody/tr[1]/td[2]', document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  var birth2 = document.evaluate('/html/body/table/tbody/tr/td[3]/table/tbody/tr[4]/td[1]/table/tbody/tr/td/table/tbody/tr/td/table/tbody/tr[1]/td[2]', document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  var birth = birth1.snapshotLength ? birth1.snapshotItem(0) : birth2.snapshotLength ? birth2.snapshotItem(0) : null;
  if( birth ) {
    personData.birthDate = birth.innerHTML.split('<br>')[0];
  }
  
  var death1 = document.evaluate('/html/body/table/tbody/tr/td[3]/table/tbody/tr[3]/td[1]/table/tbody/tr/td/table/tbody/tr/td/table/tbody/tr[2]/td[2]', document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  var death2 = document.evaluate('/html/body/table/tbody/tr/td[3]/table/tbody/tr[4]/td[1]/table/tbody/tr/td/table/tbody/tr/td/table/tbody/tr[2]/td[2]', document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  var death = death1.snapshotLength ? death1.snapshotItem(0) : death2.snapshotLength ? death2.snapshotItem(0) : null;
  if( death ) {
    personData.deathDate = death.innerHTML.split('<br>')[0];
  }
  
  debug('data', personData);
  emitter.emit('data', personData);
  
}