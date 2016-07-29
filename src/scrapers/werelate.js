var debug = require('debug')('genscrape:scrapers:werela'),
    utils = require('../utils'),
    GedcomX = require('gedcomx-js');

var urls = [
  utils.urlPatternToRegex("http://www.werelate.org/wiki/Person:*")
];

module.exports = function(register){
  register(urls, run);
};

// A mapping of WeRelate fact types to GedcomX fact types
var factTypes = {
	"Unknown": "http://werelate.org/Unknown",
	"Birth": "http://gedcomx.org/Birth",
	"Alt Birth": "http://gedcomx.org/Birth",
	"Burial": "http://gedcomx.org/Burial",
	"Alt Burial": "http://gedcomx.org/Burial",
	"Christening": "http://gedcomx.org/Christening",
	"Alt Christening": "http://gedcomx.org/Christening",
	"Death": "http://gedcomx.org/Death",
	"Alt Death": "http://gedcomx.org/Death",
	"Adoption": "http://gedcomx.org/Adoption",
	"Ancestral File Number": "http://werelate.org/AncestralFileNumber",
	"Baptism": "http://gedcomx.org/Baptism",
	"Bar Mitzvah": "http://gedcomx.org/BarMitzvah",
	"Bat Mitzvah": "http://gedcomx.org/BatMitzvah",
	"Blessing": "http://gedcomx.org/Blessing",
	"Caste": "http://gedcomx.org/Caste",
	"Cause of Death": "http://werelate.org/CauseOfDeath",
	"Census": "http://gedcomx.org/Census",
	"Citizenship": "http://werelate.org/Citizenship",
	"Confirmation": "http://gedcomx.org/Confirmation",
	"Cremation": "http://gedcomx.org/Cremation",
	"Degree": "http://gedcomx.org/Education",
	"DNA": "http://werelate.org/DNA",
	"Education": "http://gedcomx.org/Education",
	"Emigration": "http://gedcomx.org/Emigration",
	"Employment": "http://gedcomx.org/Occupation",
	"Excommunication": "http://gedcomx.org/Excommunication",
	"First Communion": "http://gedcomx.org/FirstCommunion",
	"Funeral": "http://gedcomx.org/Funeral",
	"Graduation": "http://gedcomx.org/Education",
	"Illness": "http://werelate.org/Illness",
	"Immigration": "http://gedcomx.org/Immigration",
	"Living": "http://gedcomx.org/Living",
	"Medical": "http://gedcomx.org/Medical",
	"Military": "http://gedcomx.org/MilitaryService",
	"Mission": "http://gedcomx.org/Mission",
	"Namesake": "http://gedcomx.org/Namesake",
	"Nationality": "http://gedcomx.org/Nationality",
	"Naturalization": "http://gedcomx.org/Naturalization",
	"Obituary": "http://werelate.org/Obituary",
	"Occupation": "http://gedcomx.org/Occupation",
	"Ordination": "http://gedcomx.org/Ordination",
	"Pension": "http://werelate.org/Pension",
	"Physical Description": "http://gedcomx.org/PhysicalDescription",
	"Probate": "http://gedcomx.org/Probate",
	"Property": "http://gedcomx.org/Property",
	"Reference Number": "http://werelate.org/ReferenceNumber",
	"Religion": "http://gedcomx.org/Religion",
	"Residence": "http://gedcomx.org/Residence",
	"Retirement": "http://gedcomx.org/Retirement",
	"Soc Sec No": "http://gedcomx.org/NationalId",
	"Stillborn": "http://gedcomx.org/Stillbirth",
	"Title (nobility)": "http://werelate.org/TitleOfNobility",
	"Will": "http://gedcomx.org/Will",
	"Distribution List": "http://werelate.org/AfricanAmerican/Distribution List",
	"Emancipation": "http://werelate.org/AfricanAmerican/Emancipation",
	"Escape or Runaway": "http://werelate.org/AfricanAmerican/Escape or Runaway",
	"Estate Inventory": "http://werelate.org/AfricanAmerican/Estate Inventory",
	"Estate Settlement": "http://werelate.org/AfricanAmerican/Estate Settlement",
	"First Appearance": "http://werelate.org/AfricanAmerican/First Appearance",
	"Freedmen's Bureau": "http://werelate.org/AfricanAmerican/Freedmen's Bureau",
	"Hired Away": "http://werelate.org/AfricanAmerican/Hired Away",
	"Homestead": "http://werelate.org/AfricanAmerican/Homestead",
	"Household List": "http://werelate.org/AfricanAmerican/Household List",
	"Plantation Journal": "http://werelate.org/AfricanAmerican/Plantation Journal",
	"Purchase": "http://werelate.org/AfricanAmerican/Purchase",
	"Recapture": "http://werelate.org/AfricanAmerican/Recapture",
	"Relocation": "http://werelate.org/AfricanAmerican/Relocation",
	"Sale": "http://werelate.org/AfricanAmerican/Sale",
	"Slave List": "http://werelate.org/AfricanAmerican/Slave List",
	"Other": "http://werelate.org/Other"
};

function run(emitter){
  
  debug('run');
  
  var gedx = GedcomX(),
      primaryPerson = GedcomX.Person();
      
  gedx.addPerson(primaryPerson);
  
  //
  // Facts
  //
  
  // Gather the fact data
  var facts = [];
  Array.from(document.querySelectorAll('.wr-infotable-factsevents tr')).forEach(function(row){
    var label = utils.maybe(row.querySelector('span.wr-infotable-type')).textContent;
    if(label){
      facts.push({
        label: label.trim(),
        row: row
      });
    }
  });
  
  // Process the fact data
  facts.forEach(function(factInfo){
    
    var row = factInfo.row,
        label = factInfo.label,
        dateCell = row.children[1],
        placeCell = row.children[2];
    
    switch(label){
      
      case 'Name':
        primaryPerson.addSimpleName(dateCell.textContent.trim());
        break;
        
      case 'Gender':
        switch(dateCell.textContent.trim()){
          case 'Male':
            primaryPerson.setGender({
              type: 'http://gedcomx.org/Male'
            });
            break;
          case 'Female':
            primaryPerson.setGender({
              type: 'http://gedcomx.org/Female'
            });
            break;
        }
        break;
      
      // Most facts will have a date and a place
      default:
        var type = factTypes[label],
            date = dateCell.textContent,
            place = utils.maybe(placeCell.querySelector('span.wr-infotable-place')).textContent,
            value = utils.maybe(placeCell.querySelector('span.wr-infotable-desc')).textContent;
        if(type){
          var fact = GedcomX.Fact({
            type: type
          });
          if(date){
            fact.setDate({
              original: date
            });
          }
          if(place){
            fact.setPlace({
              original: place
            });
          }
          if(value){
            fact.setValue(value);
          }
          primaryPerson.addFact(fact);
        }
    }
    
  });
  
  //
  // Relationships
  //
  
  /*
  // Process spouse's name
  if( recordData.marriage ) {
    var spouseNameParts = utils.splitName( $.trim( $('.wr-infotable-placedesc .wr-infotable-desc', recordData.marriage).text().substring(3) ) );
    personData.spouseGivenName = spouseNameParts[0];
    personData.spouseFamilyName = spouseNameParts[1];
  }
  
  // Get parents names
  var parentsBox = $('.wr-infobox-parentssiblings:first');
  if( parentsBox.length == 1 ){
    $('ul .wr-infobox-fullname', parentsBox).each(function(i,e){
      var parentNameParts = utils.splitName( $.trim( $(this).text().substring(4) ) );
      if( i == 0 ) {
        personData.fatherGivenName = parentNameParts[0];
        personData.fatherFamilyName = parentNameParts[1];
      } else {
        personData.motherGivenName = parentNameParts[0];
        personData.motherFamilyName = parentNameParts[1];
      }
    });
  }
  */
  
  emitter.emit('data', gedx);
  
}