var debug = require('debug')('wikitree-person'),
    utils = require('../utils');

var urls = [
  utils.urlPatternToRegex('http://www.wikitree.com/wiki/*-*')
];

module.exports = function(register){
  register(urls, run);
};

/**
 * Called when the URL matches.
 */
function run(emitter) {
  
  debug('run');
  
  var personData = {};

  personData.givenName = $('span[itemprop="givenName"]').text();
  personData.familyName = $('meta[itemprop="familyName"]').attr('content');

  personData.birthDate = $('time[itemprop="birthDate"]').attr('datetime');
  personData.birthPlace = $('span[itemtype="http://schema.org/Event"][itemprop="birth"] span[itemtype="http://schema.org/Place"][itemprop="location"] span[itemprop="name"]').text();

  personData.deathDate = $('time[itemprop="deathDate"]').attr('datetime');
  personData.deathPlace = $('span[itemtype="http://schema.org/Event"][itemprop="death"] span[itemtype="http://schema.org/Place"][itemprop="location"] span[itemprop="name"]').text();

  $father = $('span[itemtype="http://schema.org/Person"][itemprop="parent"] a[title~=father]>span[itemprop="name"]').text();
  $mother = $('span[itemtype="http://schema.org/Person"][itemprop="parent"] a[title~=mother]>span[itemprop="name"]').text();
  $spouse = $('span[itemtype="http://schema.org/Person"][itemprop="spouse"]:first span[itemprop="name"]').text();

    var fatherNameParts = GetNames(removeHonorificTittle($father));
  if($father) {
    personData.fatherGivenName = fatherNameParts[0];
    personData.fatherFamilyName = fatherNameParts[1];
  }
  // assumes mother is married takes 2nd to last name and removes parenthesis
    var motherNameParts = GetNames(removeHonorificTittle($mother));
    if($mother) {
      personData.motherGivenName = motherNameParts[0];
      personData.motherFamilyName = motherNameParts[1].replace('(', '').replace(')', '');
    }
  // assumes male spouse has 2 names and female spouse has 3 names
  var spouseNameParts = GetNames( removeHonorificTittle($spouse) );
  if($spouse) {
    personData.spouseGivenName = spouseNameParts[0];
    personData.spouseFamilyName = spouseNameParts[1];
  }

  personData.marriageDate = $('span[itemprop="marriage"] time[itemprop="startDate"]').attr('datetime');
  personData.marriagePlace = $('span[itemtype="http://schema.org/Event"][itemprop="marriage"] span[itemtype="http://schema.org/Place"][itemprop="location"] span[itemprop="name"]:first').text();

  emitter.emit('data', utils.clean(personData));
}

function GetNames(name){
  if(name) {
    var names = name.match(/\S+/g);
    var fn = names[0];
    var ln = function(){
      for (i=0;i < names.length;i++) {
        if (names[i].indexOf('(') > -1) {
          return names[i].replace('(', '').replace(')', '');
        }
      }
      return names[names.length -1];
    }
    return [fn,ln()];
  }
}

// removes titles such as Dr., Sr., and Jr.
function removeHonorificTittle(name){
  if(name) {
    return name.replace('Dr. ', '')
        .replace('President ', '')
        .replace(' Sr.', '')
        .replace(' Jr.', '')
        .replace(' III', '');
  }
}