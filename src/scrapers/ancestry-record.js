var debug = require('debug')('ancestry-record'),
    utils = require('../utils');

var urls = [
  utils.urlPatternToRegex('http://search.ancestry.com/cgi-bin/sse.dll*'),
  utils.urlPatternToRegex('http://search.ancestryinstitution.com/cgi-bin/sse.dll*')
];

module.exports = function(register){
  register(urls, setup);
};

var alternateNamesRegex = /\[[^\[\]]*\]/g;

function setup(emitter) {
  
  if( $('#recordData').length !== 1) {
    debug('no data');
    emitter.emit('noData');
    return;
  }
  
  var personData = {};
  var recordData = {};
  $('#recordData .table tr').each(function(){
    var row = $(this);
    // Take the row label, trim leading and trailing whitespace, 
    // lowercase it, and remove the trailing ":".
    // This will serve as the key in the recordData object
    var label = $.trim( $('th', row).text() ).toLowerCase().slice(0, -1);
    if( label && !recordData[label] ) {
      recordData[label] = row;
    }
  });
  
  // Process the name
  var name = checkMultipleFields(recordData, ['name', 'name of deceased']);
  if( name ) {
    // The regex replace removes alternate names which always appear surrounded by []
    var nameParts = utils.splitName( $.trim( name.children().eq(1).text().replace(alternateNamesRegex, '') ) );
    if(nameParts[0]) personData.givenName = nameParts[0];
    if(nameParts[1]) personData.familyName = nameParts[1];
  }
  
  // Process estimated birth year
  var birthDate = checkMultipleFields( recordData, ['birth year', 'birth date', 'born', 'estimated birth year'] );
  if( birthDate ) {
    personData.birthDate = $.trim( birthDate.children().eq(1).text() ).replace('abt ','');
  }
  
  // Process the birthplace
  var birthPlace = checkMultipleFields(recordData, ['birthplace', 'birth place']);
  if( birthPlace ) {
    personData.birthPlace = $.trim( birthPlace.children().eq(1).text() );
  }
  
  var deathDate = checkMultipleFields(recordData, ['death year', 'death date', 'died']);
  if(deathDate){
    personData.deathDate = $.trim( deathDate.children().eq(1).text() );
  }
  
  var deathPlace = checkMultipleFields(recordData, ['deathplace', 'death place']);
  if( deathPlace ) {
    personData.deathPlace = $.trim( deathPlace.children().eq(1).text() );
  }
  
  if( recordData['marriage date'] ){
    personData.marriageDate = $.trim(recordData['marriage date'].children().eq(1).text());
  }
  
  if( recordData['marriage place'] ){
    personData.marriagePlace = $.trim(recordData['marriage place'].children().eq(1).text());
  }
  
  // Father's name
  var fathersName = checkMultipleFields(recordData, ["father's name", 'father name']);
  if( fathersName ) {
    var fatherNameParts = utils.splitName( $.trim( fathersName.children().eq(1).text().replace(alternateNamesRegex, '') ) );
    if(fatherNameParts[0]) personData.fatherGivenName = fatherNameParts[0];
    if(fatherNameParts[1]) personData.fatherFamilyName = fatherNameParts[1];
  }
  
  // Mother's name
  var mothersName = checkMultipleFields(recordData, ["mother's name", 'mother name']);
  if( mothersName ) {
    var motherNameParts = utils.splitName( $.trim( mothersName.children().eq(1).text().replace(alternateNamesRegex, '') ) );
    if(motherNameParts[0]) personData.motherGivenName = motherNameParts[0];
    if(motherNameParts[1]) personData.motherFamilyName = motherNameParts[1];
  }
  
  // Spouse's name
  var spousesName = checkMultipleFields(recordData, ["spouse's name", 'spouse name']);
  if( spousesName ) {
    var spouseNameParts = utils.splitName( $.trim( spousesName.children().eq(1).text().replace(alternateNamesRegex, '') ) );
    if(spouseNameParts[0]) personData.spouseGivenName = spouseNameParts[0];
    if(spouseNameParts[1]) personData.spouseFamilyName = spouseNameParts[1];
  }
  
  debug('data', personData);
  emitter.emit('data', personData);
}

function checkMultipleFields( recordData, fields ) {
  for(var j in fields) {
    if( recordData[fields[j]] ) {
      return recordData[fields[j]];
    }
  }
  return undefined;
}