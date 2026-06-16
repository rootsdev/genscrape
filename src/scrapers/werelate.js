var debug = require('debug')('genscrape:scrapers:werela'),
    utils = require('../utils'),
    GedcomX = require('gedcomx-js');

var urls = [
  utils.urlPatternToRegex("https://www.werelate.org/wiki/Person:*")
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
      primaryPerson = GedcomX.Person({
        principal: true,
        id: getRecordId(document.location.href),
        identifiers: {
          'genscrape': getRecordIdentifier(document.location.href)
        }
      });

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
        if(row.children.length === 3){
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
    }

  });

  //
  // Relationships
  //

  // Parents and siblings
  Array.from(document.querySelectorAll('.wr-infobox-parentssiblings')).forEach(function(family){

    var parents = family.querySelector('ul'),
        children = family.querySelector('ol'),
        marriage = family.querySelector('.wr-infobox-event'),
        parent1Label = parentLabel(parents.children[0]),
        mother, father;

    if(parent1Label === 'F'){
      father = processPerson(parents.children[0], 'http://gedcomx.org/Male');
      mother = processPerson(parents.children[1], 'http://gedcomx.org/Female');
    } else {
      father = processPerson(parents.children[1], 'http://gedcomx.org/Male');
      mother = processPerson(parents.children[0], 'http://gedcomx.org/Female');
    }

    if(father){
      gedx.addPerson(father);
      gedx.addRelationship({
        type: 'http://gedcomx.org/ParentChild',
        person1: father,
        person2: primaryPerson
      });
    }

    if(mother){
      gedx.addPerson(mother);
      gedx.addRelationship({
        type: 'http://gedcomx.org/ParentChild',
        person1: mother,
        person2: primaryPerson
      });
    }

    if(father && mother){
      var couple = GedcomX.Relationship({
        type: 'http://gedcomx.org/Couple',
        person1: father,
        person2: mother
      });
      if(marriage){
        couple.addFact({
          type: 'http://gedcomx.org/Marriage',
          date: {
            original: utils.maybe(marriage.querySelector('.wr-infobox-date')).textContent
          }
        });
      }
      gedx.addRelationship(couple);
    }

    Array.from(children.children).forEach(function(child){

      // Skip the entry for the primary person
      if(child.querySelector('.selflink')){
        return;
      }

      child = processPerson(child);
      gedx.addPerson(child);

      if(father){
        gedx.addRelationship({
          type: 'http://gedcomx.org/ParentChild',
          person1: father,
          person2: child
        });
      }

      if(mother){
        gedx.addRelationship({
          type: 'http://gedcomx.org/ParentChild',
          person1: mother,
          person2: child
        });
      }
    });
  });

  // Spouses and children
  Array.from(document.querySelectorAll('.wr-infobox-spousechildren')).forEach(function(family){

    var parents = family.querySelector('ul'),
        children = family.querySelector('ol'),
        marriage = family.querySelector('.wr-infobox-event'),
        parent1Label = parentLabel(parents.children[0]),
        parent2Label = parentLabel(parents.children[1]),
        spouse, spouseLabel, couple;

    // Determine whether the primary person is the husband or the wife
    if(parents.children[0].querySelector('.selflink')){
      spouse = processPerson(parents.children[1]);
      spouseLabel = parent2Label;
    } else {
      spouse = processPerson(parents.children[0]);
      spouseLabel = parent1Label;
    }

    spouse.setGender({
      type: spouseLabel === 'H' ? 'http://gedcomx.org/Male' : 'http://gedcomx.org/Female'
    });

    gedx.addPerson(spouse);

    couple = GedcomX.Relationship({
      type: 'http://gedcomx.org/Couple',
      person1: primaryPerson,
      person2: spouse
    });

    if(marriage){
      couple.addFact({
        type: 'http://gedcomx.org/Marriage',
        date: {
          original: utils.maybe(marriage.querySelector('.wr-infobox-date')).textContent
        }
      });
    }

    gedx.addRelationship(couple);

    if(children){
      Array.from(children.children).forEach(function(child){

        child = processPerson(child);
        gedx.addPerson(child);

        gedx.addRelationship({
          type: 'http://gedcomx.org/ParentChild',
          person1: primaryPerson,
          person2: child
        });

        gedx.addRelationship({
          type: 'http://gedcomx.org/ParentChild',
          person1: spouse,
          person2: child
        });
      });
    }
  });

  // TODO: gather sources listed in the profile

  // Agent
  gedx.addAgent(GedcomX.Agent()
    .setId('agent')
    .addName({
      lang: 'en',
      value: 'WeRelate'
    })
    .setHomepage({
      resource: 'https://www.werelate.org'
    }));

  // SourceDescription
  gedx.addSourceDescriptionToAll({
    about: document.location.href,
    titles: [
      {
        value: document.title
      }
    ],
    citations: [
      {
        value: document.title + ', WeRelate.org (' + window.document.location.href
          + ' : accessed ' + utils.getDateString() + ')'
      }
    ],
    repository: {
      resource: '#agent'
    }
  });

  emitter.emit('data', gedx);
}

/**
 * Get the label for a parent in a family box. For parents it is F (Father) or
 * M (Mother). For spouses it's H (Husband) or W (Wife).
 *
 * @param {Element} parent Parent's li element
 * @return {String} label
 */
function parentLabel(parent){
  if(parent){
    return utils.maybe(parent.querySelector('.wr-infobox-label')).textContent;
  }
}

/**
 * Create a GedcomX.Person from a person entry in a family box
 *
 * @param {Element} element Person's li DOM element
 * @param {String} gender
 * @return {GedcomX.Person}
 */
function processPerson(element, gender){
  if(element){
    var a = element.querySelector('a'),
        href = a ? a.href : '',
        person = GedcomX.Person({
          id: getRecordId(href),
          identifiers: {
            'genscrape': getRecordIdentifier(href)
          }
        }).addSimpleName(element.querySelector('.wr-infobox-fullname a').textContent),
        yearRange = utils.maybe(element.querySelector('.wr-infobox-yearrange')).textContent || ' - ',
        yearRangeParts = yearRange.split(' - ');
    if(yearRangeParts[0]){
      person.addFact({
        type: 'http://gedcomx.org/Birth',
        date: {
          original: yearRangeParts[0]
        }
      });
    }
    if(yearRangeParts[1]){
      person.addFact({
        type: 'http://gedcomx.org/Death',
        date: {
          original: yearRangeParts[1]
        }
      });
    }
    if(gender){
      person.setGender({
        type: gender
      });
    }
    return person;
  }
}

/**
 * Get the record ID
 *
 * @param {String} url
 * @return {String}
 */
function getRecordId(url) {
  return decodeURIComponent(url.split('/').pop().split(':')[1]).replace(/\(|\)/g,'');
}

/**
 * Get a record's identifier
 *
 * @param {String} url
 * @return {String}
 */
function getRecordIdentifier(url) {
  return 'genscrape://werelate/person:' + (url.split('/').pop().split(':')[1]);
}