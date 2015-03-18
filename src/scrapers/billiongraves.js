var debug = require('debug')('billiongraves'),
    utils = require('../utils');

var urls = [
  utils.urlPatternToRegex("http://billiongraves.com/pages/record/*")
];

module.exports = function(register){
  register(urls, run);
};

function run(emitter){
  debug('run');
  
  var nameParts = utils.splitName( $('.info_record_name').text() );
    
  var personData = {
    'givenName': nameParts[0],
    'familyName': nameParts[1],
    'birthDate': $('.birth_date').text().trim(),
    'deathDate': $('.death_date').text().trim()
  };
  
  for(var a in personData){
    if(personData[a] === 'Not Available'){
      delete personData[a];
    }
  }
  
  debug('data', personData);
  emitter.emit('data', personData);
  
}