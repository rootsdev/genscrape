var debug = require('debug')('genscrape:scrapers:genealogieonline'),
    utils = require('../utils'),
    GedcomX = require('gedcomx-js');

var urls = [
  utils.urlPatternToRegex("https://www.genealogieonline.nl/*")
];

module.exports = function(register){
  register(urls, run);
};

function run(emitter){
  
  var $schemaPerson = document.querySelector('[itemtype="http://schema.org/Person"]'),
      gedx = new GedcomX(),
      familyName = queryPropContent($schemaPerson, 'familyName');

  if (familyName) {
    
    var primaryPerson = GedcomX.Person().addNameFromParts({
      'http://gedcomx.org/Given': queryPropContent($schemaPerson, 'givenName'),
      'http://gedcomx.org/Surname': familyName
    });
    gedx.addPerson(primaryPerson);
    
    var gender = queryPropContent($schemaPerson, 'gender');
    switch(gender){
      case 'male':
        primaryPerson.setGender({
          type: 'http://gedcomx.org/Male'
        });
        break;
      case 'female':
        primaryPerson.setGender({
          type: 'http://gedcomx.org/Female'
        });
        break;
    }
    
    primaryPerson.addFact(queryEvent($schemaPerson, 'birth', 'http://gedcomx.org/Birth'));
    primaryPerson.addFact(queryEvent($schemaPerson, 'death', 'http://gedcomx.org/Death'));
    
    /*
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
    */
   
    emitter.emit('data', gedx);
  }
    
  else {
    emitter.emit('noData') ;     
  }  
}

/**
 * Get the specified event data, if it exists
 * 
 * @param {Element} $element DOM Element to search inside of
 * @param {String} event Event name
 * @param {String} type GedcomX fact type
 * @return {GedcomX.Fact}
 */
function queryEvent($element, event, type){
  // var birthPlace=$('div[itemtype="http://schema.org/Person"]:eq(0) div[itemprop="birth"] span[itemprop="location"] span[itemprop="address"] meta[itemprop="addressLocality"]').attr("content");
  // var birthDate=$('div[itemtype="http://schema.org/Person"]:eq(0) div[itemprop="birth"] meta[itemprop="startDate"]').attr("content");
  
  var birthPlace = queryPropContent($element, [event + 'Place', 'address', 'addressLocality']);
  var birthDate = queryPropContent($element, event + 'Date');
  
  if(birthPlace || birthDate){
    var birth = GedcomX.Fact({
      type: type
    });
    
    if(birthPlace){
      birth.setPlace({
        original: birthPlace
      });
    }
    if(birthDate){
      birth.setDate({
        original: birthDate
      });
    }
    
    return birth;
  }
}

/**
 * Get the content of a schema property
 * 
 * @param {Element} $element DOM Element to search inside of
 * @param {String|Array} name Property name to search for
 * @return {String}
 */
function queryPropContent($element, name){
  var $prop = queryProp($element, name);
  return $prop ? $prop.content : '';
}

/**
 * Get the a schema property
 * 
 * @param {Element} element DOM Element to search inside of
 * @param {String|Array} name Property name to search for
 * @return {Element}
 */
function queryProp($element, name){
  if($element){
    
    // If only one string was given then turn it into an array
    if(!Array.isArray(name)){
      name = [name];
    }
    
    var i = 0;
    do {
      $element = $element.querySelector('[itemprop="' + name[i] + '"]');
    } while (++i < name.length && $element);
    
    return $element;
  }
}