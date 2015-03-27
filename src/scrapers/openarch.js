var debug = require('debug')('openarch'),
    utils = require('../utils'),
    _ = require('lodash');

var urls = [
  utils.urlPatternToRegex("https://www.openarch.nl/show*")
];

module.exports = function(register){
  register(urls, run);
};

function run(emitter){
  
  /* Open Archives uses schema.org/Person microdata, so scraping is easy ! */

  var givenName=$('div[itemtype="http://schema.org/Person"]:eq(0) meta[itemprop="givenName"]').attr("content");
  var familyName=$('div[itemtype="http://schema.org/Person"]:eq(0) meta[itemprop="familyName"]').attr("content");

  var birthPlace;
  var birthDate;

  var fathid=0;
  var mothid=1;
  var fatherGivenName;
  var fatherFamilyName;
  var motherGivenName;
  var motherFamilyName;
  
  var spouseGivenName;
  var spouseFamilyName;
  
  
  if (givenName) {
    birthPlace=$('div[itemtype="http://schema.org/Person"]:eq(0) span[itemprop="birth"] span[itemprop="location"] meta[itemprop="name"]').attr("content");
    birthDate=$('div[itemtype="http://schema.org/Person"]:eq(0) span[itemprop="birth"] meta[itemprop="startDate"]').attr("content");
    spouseGivenName=$('div[itemtype="http://schema.org/Person"]:eq(1) meta[itemprop="givenName"]').attr("content");
    spouseFamilyName=$('div[itemtype="http://schema.org/Person"]:eq(1) meta[itemprop="familyName"]').attr("content");

    if (!spouseGivenName && $('p[itemprop="parent"]:eq(0) meta[itemprop="gender"]').attr("content")=="female") {
      fathid=1;
      mothid=0;
    }
  } else {
    givenName=$('li[itemtype="http://schema.org/Person"]:eq(0) meta[itemprop="givenName"]').attr("content");
    familyName=$('li[itemtype="http://schema.org/Person"]:eq(0) meta[itemprop="familyName"]').attr("content");
    birthPlace=$('li[itemtype="http://schema.org/Person"]:eq(0) span[itemprop="birth"] span[itemprop="location"] meta[itemprop="name"]').attr("content");
    birthDate=$('li[itemtype="http://schema.org/Person"]:eq(0) span[itemprop="birth"] meta[itemprop="startDate"]').attr("content");
  }
  
  fatherGivenName=$('p[itemprop="parent"]:eq('+fathid+') meta[itemprop="givenName"]').attr("content");
  fatherFamilyName=$('p[itemprop="parent"]:eq('+fathid+') meta[itemprop="familyName"]').attr("content");
  motherGivenName=$('p[itemprop="parent"]:eq('+mothid+') meta[itemprop="givenName"]').attr("content");
  motherFamilyName=$('p[itemprop="parent"]:eq('+mothid+') meta[itemprop="familyName"]').attr("content");

  if (givenName) {
    var personData= {
      'givenName': givenName,
      'familyName': familyName,
      'birthPlace': birthPlace,
      'birthDate': birthDate,
      'spouseGivenName': spouseGivenName,
      'spouseFamilyName': spouseFamilyName,
      'fatherGivenName': fatherGivenName,
      'fatherFamilyName': fatherFamilyName,
      'motherGivenName': motherGivenName,
      'motherFamilyName': motherFamilyName
    };

    emitter.emit('data', _.pick(personData, _.identity));
  } else {
    emitter.emit('noData');
  }
  
}