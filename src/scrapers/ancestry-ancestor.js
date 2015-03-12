var debug = require('debug')('ancestry-ancestor'),
    utils = require('../utils');

var urls = [
  utils.urlPatternToRegex('http://trees.ancestry.com/tree/*/person/*'),
  utils.urlPatternToRegex('http://trees.ancestryinstitution.com/tree/*/person/*')
];

module.exports = function(register){
  register(urls, run);
};

function run(emitter) {
  
  var personData = {};
  
  try {
  
    // Get the name
    var nameParts = utils.splitName( $('.pInfo h1').html() );
    
    personData.givenName = nameParts[0];
    personData.familyName = nameParts[1];
    
    var events = {};
    
    // Gather events
    $('.eventList .eventDefinition').each(function(){
      var event = $(this),
          type = event.find('dt').text().trim().toLowerCase(),
          day = event.find('.eventDay').text().trim(),
          year = event.find('.eventYear').text().trim(),
          place = event.find('.eventPlace').text().trim();
      events[type] = {
        date: day + ' ' + year,
        place: place
      };      
    });
    
    // Birth
    var birth = events.birth || events.christening || null;
    if(birth) {
      personData['birthDate'] = birth.date;
      personData['birthPlace'] = birth.place;
    }
    
    // Death
    var death = events.death || events.burial || null;
    if(death) {
      personData['deathDate'] = death.date;
      personData['deathPlace'] = death.place;
    }
    
    // TODO get the marriage info
    
    //
    // Process relationships
    //
    
    var parentsBlock = $('.famMem .section').eq(0);
    
    // Father's name
    if($('.iconMale.add', parentsBlock).length == 0) {
      var fatherNameParts = utils.splitName( $('.iconMale + .nameandyears a', parentsBlock).text() );
      if(fatherNameParts[0]) personData['fatherGivenName'] = fatherNameParts[0];
      if(fatherNameParts[1]) personData['fatherFamilyName'] = fatherNameParts[1];
    }
    
    // Mother's name
    if($('.iconFemale.add', parentsBlock).length == 0) {
      var motherNameParts = utils.splitName( $('.iconFemale + .nameandyears a', parentsBlock).text() );
      if(motherNameParts[0]) personData['motherGivenName'] = motherNameParts[0];
      if(motherNameParts[1]) personData['motherFamilyName'] = motherNameParts[1];
    }
    
    // Spouse's name
    var spouseBlock = $('.famMem .section').eq(1);
    if($('.add', spouseBlock).length == 0){
      var spouseNameParts = utils.splitName( $('.main .nameandyears a', spouseBlock).text() );
      if(spouseNameParts[0]) personData['spouseGivenName'] = spouseNameParts[0];
      if(spouseNameParts[1]) personData['spouseFamilyName'] = spouseNameParts[1];
    }
  
  } catch(e) {
    debug('error', e);
    emitter.emit('error', e);
  }
  
  debug('data');
  emitter.emit('data', personData);

}