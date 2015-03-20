var debug = require('debug')('genealogieonline'),
    utils = require('../utils'),
    _ = require('lodash');

var urls = [
  utils.urlPatternToRegex("https://www.genealogieonline.nl/*")
];

module.exports = function(register){
  register(urls, run);
};

function run(emitter){
  
  var familyName=$('div[itemtype="http://schema.org/Person"]:eq(0) meta[itemprop="familyName"]').attr("content");

  if (familyName) {
    var givenName=$('div[itemtype="http://schema.org/Person"]:eq(0) meta[itemprop="givenName"]').attr("content");
    var birthPlace=$('div[itemtype="http://schema.org/Person"]:eq(0) div[itemprop="birth"] span[itemprop="location"] span[itemprop="address"] meta[itemprop="addressLocality"]').attr("content");
    var birthDate=$('div[itemtype="http://schema.org/Person"]:eq(0) div[itemprop="birth"] meta[itemprop="startDate"]').attr("content");
    var deathPlace=$('div[itemtype="http://schema.org/Person"]:eq(0) div[itemprop="death"] span[itemprop="location"] meta[itemprop="name"]').attr("content");
    var deathDate=$('div[itemtype="http://schema.org/Person"]:eq(0) div[itemprop="death"] meta[itemprop="startDate"]').attr("content");
    var spouseGivenName=$('div[itemtype="http://schema.org/Person"]:eq(0) span[itemprop="spouse"]:eq(0) meta[itemprop="givenName"]').attr("content");
    var spouseFamilyName=$('div[itemtype="http://schema.org/Person"]:eq(0) span[itemprop="spouse"]:eq(0) meta[itemprop="familyName"]').attr("content");
    var marriagePlace=$('div[itemtype="http://schema.org/Person"]:eq(0) span[itemprop="marriage"] span[itemprop="location"] span[itemprop="address"] meta[itemprop="addressLocality"]').attr("content");
    var marriageDate=$('div[itemtype="http://schema.org/Person"]:eq(0) span[itemprop="marriage"] meta[itemprop="startDate"]').attr("content");

    var fathid=0;
    var mothid=1;
    if ($('div[itemtype="http://schema.org/Person"]:eq(0) div[itemprop="parent"]:eq(0) meta[itemprop="gender"]').attr("content")=="female") {
    	 fathid=1;
    	 mothid=0;
    }
    var fatherGivenName=$('div[itemtype="http://schema.org/Person"]:eq(0) div[itemprop="parent"]:eq('+fathid+') meta[itemprop="givenName"]').attr("content");
    var fatherFamilyName=$('div[itemtype="http://schema.org/Person"]:eq(0) div[itemprop="parent"]:eq('+fathid+') meta[itemprop="familyName"]').attr("content");

    var motherGivenName=$('div[itemtype="http://schema.org/Person"]:eq(0) div[itemprop="parent"]:eq('+mothid+') meta[itemprop="givenName"]').attr("content");
    var motherFamilyName=$('div[itemtype="http://schema.org/Person"]:eq(0) div[itemprop="parent"]:eq('+mothid+') meta[itemprop="familyName"]').attr("content");

    var personData= {
      'givenName': givenName,
      'familyName': familyName,
      'birthPlace': birthPlace,
      'birthDate': birthDate,
      'deathPlace': deathPlace,
      'deathDate': deathDate,
      'spouseGivenName': spouseGivenName,
      'spouseFamilyName': spouseFamilyName,
      'marriagePlace': marriagePlace,
      'marriageDate': marriageDate,
      'fatherGivenName': fatherGivenName,
      'fatherFamilyName': fatherFamilyName,
      'motherGivenName': motherGivenName,
      'motherFamilyName': motherFamilyName
    };
   
    // Remove falsy values and emit
    emitter.emit('data', _.pick(personData, _.identity));
    
  }
      
  else {
    emitter.emit('noData') ;     
  }  
}