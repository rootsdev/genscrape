var debug = require('debug')('findmypast-record'),
    utils = require('../utils'),
    _ = require('lodash');

var urls = [
  /^http:\/\/search\.findmypast\.(co\.uk|com|ie|com\.au)\/record/
];

module.exports = function(register){
  register(urls, run);
};

function run(emitter) {
  
  if( $('#transcriptionDisplayTable').length !== 1) {
    debug('no data table');
    emitter.emit('noData');
    return;
  }
  
  var personData = {},
      dataFields = getDataFields();
      
  personData.givenName = getGivenName(dataFields);
  personData.familyName = getFamilyName(dataFields);
  
  personData.birthDate = getBirthDate(dataFields);
  personData.birthPlace = getBirthPlace(dataFields);
  
  personData.deathDate = getDeathDate(dataFields);
  personData.deathPlace = getDeathPlace(dataFields);
  
  personData.spouseGivenName = getSpouseGivenName(dataFields);
  personData.spouseFamilyName = getSpouseFamilyName(dataFields);
  
  personData.marriageDate = getMarriageDate(dataFields);
  personData.marriagePlace = getMarriagePlace(dataFields);
  
  personData.fatherGivenName = getFatherGivenName(dataFields);
  personData.motherGivenName = getMotherGivenName(dataFields);

  personData = utils.clean(personData);
  
  debug('data', personData);
  emitter.emit('data', personData);
}

function getGivenName(data){
  return processName(checkMultipleFields(data, ['first name(s)']));
}

function getFamilyName(data){
  return processName(checkMultipleFields(data, ['last name']));
}

function getBirthDate(data){
  var year = data['birth year'],
      month = data['birth month'],
      day = data['birth day'];
  return processDate(year, month, day);
}

function getBirthPlace(data){
  var simple = checkMultipleFields(data, ['birth place','birth state']);
  if(simple){
    return simple;
  }
  if(data['subcategory'] === 'Births & baptisms'){
    return getPlace(data);
  }
}

function getDeathDate(data){
  var year = data['death year'],
      month = data['death month'],
      day = data['death day'];
  return processDate(year, month, day);
}

function getDeathPlace(data){
  var simple = checkMultipleFields(data, ['death place','death state']);
  if(simple){
    return simple;
  }
  if(data['subcategory'] === 'Deaths & burials'){
    return getPlace(data);
  }
}

function getMarriageDate(data){
  var year = data['marriage year'],
      month = data['marriage month'],
      day = data['marriage day'];
  return processDate(year, month, day);
}

function getMarriagePlace(data){
  var simple = checkMultipleFields(data, ['marriage place','marriage state']);
  if(simple){
    return simple;
  }
  if(data['subcategory'] === 'Marriages & divorces'){
    return getPlace(data);
  }
}

function getSpouseGivenName(data){
  return processName(checkMultipleFields(data, ['spouse\'s first name(s)']));
}

function getSpouseFamilyName(data){
  return processName(checkMultipleFields(data, ['spouse\'s last name']));
}

function getFatherGivenName(data){
  return processName(checkMultipleFields(data, ['father\'s first name(s)']));
}

function getMotherGivenName(data){
  return processName(checkMultipleFields(data, ['mother\'s first name(s)']));
}

/**
 * Extract the place for the record.
 * This method doesn't pay attention to whether the
 * place is for birth, marriage, death, residence, or other.
 * The method calling this needs to take care of interpreting
 * what event the place is associated with.
 */
function getPlace(data){
  var town = checkMultipleFields(data, ['place','district','town','residence town','parish']),
      state = checkMultipleFields(data, ['county','state','residence state']),
      country = checkMultipleFields(data, ['country']);
  // Remove falsy values, capitalize properly, and turn into a readable string
  return _.map(_.compact([town, state, country]), utils.toTitleCase).join(', ');
}

/**
 * Concatenate year,month,day if all are defined.
 * Return year if only defined.
 * Return undefined if no data.
 */
function processDate(year, month, day){
  if(year){
    if(month && day){
      return day + ' ' + month + ' ' + year;
    } else {
      return year;
    }
  }
}

/**
 * Capitalize a name properly. Ignore empty "-" values.
 */
function processName(name){
  debug('processName:' + name);
  if(!name || name === '-'){
    return;
  } else {
    return utils.toTitleCase(name);
  }
}

/**
 * Convert data table DOM into a map object.
 */
function getDataFields(){
  var data = {};
  $('#transcriptionDisplayTable tr').each(function(){
    var row = $(this),
        name = row.find('th').text().trim().toLowerCase(),
        value = row.find('td').text().trim();
    if(name && value && value !== '-'){
      data[name] = value;
    }
  });
  return data;
}

function checkMultipleFields(recordData, fields) {
  for(var j in fields) {
    if(recordData[fields[j]]) {
      return recordData[fields[j]];
    }
  }
}