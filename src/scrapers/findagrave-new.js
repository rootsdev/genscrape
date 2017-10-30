var debug = require('debug')('genscrape:scrapers:findagrave-new'),
    utils = require('../utils'),
    GedcomX = require('gedcomx-js');

var urls = [
  utils.urlPatternToRegex("https://new.findagrave.com/memorial/*"),
  utils.urlPatternToRegex("https://new.findagrave.com/cemetery/online/*")
];

module.exports = function(register){
  register(urls, function(emitter){
    run(emitter);
  });
};

function run(emitter){
  debug('run');
  
  var gedx = GedcomX(),
      primaryPerson = GedcomX.Person({
        principal: true,
        id: getMemorialId(document.location.href),
        identifiers: {
          'genscrape': getMemorialIdentifier(document.location.href)
        }
      });
  
  gedx.addPerson(primaryPerson);
  
  primaryPerson.addName(getName());
  primaryPerson.addFact(getBirthFact());
  primaryPerson.addFact(getDeathFact());
  primaryPerson.addFact(getBurialFact());
  
  var family = getRelativeGroups();
  
  // When processing the family we can't make any assumptions about relationships
  // between the family members. I.e. we don't know whether the parents should
  // have a couple relationship, whether siblings should have a parent-child
  // relationship with the parents, and whether children should have a
  // parent-child relationship with the spouses. This also means that siblings
  // won't be referenced by any relationship but will be included as persons
  // in the document.
  
  if(family.parents) {
    family.parents.forEach(function(parent){
      gedx.addPerson(parent);
      gedx.addRelationship({
        type: 'http://gedcomx.org/ParentChild',
        person1: parent,
        person2: primaryPerson
      });
    });
  }
  
  if(family.spouse) {
    family.spouse.forEach(function(spouse){
      gedx.addPerson(spouse);
      gedx.addRelationship({
        type: 'http://gedcomx.org/Couple',
        person1: primaryPerson,
        person2: spouse
      });
    });
  }
  if(family.spouses) {
    family.spouses.forEach(function(spouse){
      gedx.addPerson(spouse);
      gedx.addRelationship({
        type: 'http://gedcomx.org/Couple',
        person1: primaryPerson,
        person2: spouse
      });
    });
  }
  
  if(family.children) {
    family.children.forEach(function(child){
      gedx.addPerson(child);
      gedx.addRelationship({
        type: 'http://gedcomx.org/ParentChild',
        person1: primaryPerson,
        person2: child
      });
    });
  }
  
  if(family.siblings) {
    family.siblings.forEach(function(sibling){
      gedx.addPerson(sibling);
    });
  }
  if(family['half siblings']){
    family['half siblings'].forEach(function(sibling){
      gedx.addPerson(sibling);
    });
  }
  
  // Agent
  var agent = GedcomX.Agent({
    id: 'agent',
    names: [{
      lang: 'en',
      value: 'Find A Grave'
    }],
    homepage: {
      resource: 'https://new.findagrave.com'
    }
  });
  gedx.addAgent(agent);
  
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
        value: collapseWhitespace(document.getElementById('citationInfo').textContent)
      }
    ],
    repository: {
      resource: '#agent'
    }
  });
  
  debug('data');
  emitter.emit('data', gedx);
  
}

/**
 * Create GedcomX.Name from the name string.
 * 
 * @returns {GedcomX.Name}
 */
function getName(){
  var h1 = document.getElementById('bio-name');
  if(h1){
    var nameText =  h1.textContent.trim();
    var suffix, parts = nameText.split(',');
    if(parts.length > 1){
      suffix = parts[1];
      nameText = parts[0];
    }
    parts = utils.splitName(nameText);
    var nameForm = {
      parts: [
        {
          type: 'http://gedcomx.org/Given',
          value: parts[0]
        },
        {
          type: 'http://gedcomx.org/Surname',
          value: parts[1]
        }
      ]
    };
    if(suffix){
      nameForm.parts.push({
        type: 'http://gedcomx.org/Suffix',
        value: suffix
      });
    }
    return GedcomX.Name().addNameForm(nameForm);
  }
}

/**
 * Get the birth fact
 * 
 * @return {GedcomX.Fact}
 */
function getBirthFact() {
  var date = document.getElementById('birthDateLabel'),
      place = document.getElementById('birthLocationLabel');
  if(date || place & date.textContent !== 'unknown') {
    var birth = {
      type: 'http://gedcomx.org/Birth'
    };
    if(date) {
      birth.date = {
        original: date.textContent.trim()
      };
    }
    if(place) {
      birth.place = {
        original: place.textContent.trim()
      };
    }
    return birth;
  }
}

/**
 * Get the death fact
 * 
 * @return {GedcomX.Fact}
 */
 function getDeathFact() {
  var date = document.getElementById('deathDateLabel'),
      place = document.getElementById('deathLocationLabel');
  if(date || place & date.textContent !== 'unknown') {
    var death = {
      type: 'http://gedcomx.org/Death'
    };
    if(date) {
      death.date = {
        original: date.textContent.trim()
      };
    }
    if(place) {
      death.place = {
        original: place.textContent.trim()
      };
    }
    return death;
  }
}

/**
 * Get the burial fact
 * 
 * @returns {GedcomX.Fact}
 */
function getBurialFact(){
  var burialRow = document.querySelector('[itemtype="https://schema.org/Cemetery"]'),
      cemeteryName = burialRow.querySelector('.info'),
      placeName = burialRow.querySelector('.place');
  
  // Return a fact if we have any place data
  if(placeName || cemeteryName){
    var burialParts = [];
    if(cemeteryName) {
      burialParts.push(cemeteryName.textContent);
    }
    if(placeName) {
      burialParts.push(placeName.textContent);
    }
    
    return new GedcomX.Fact({
      type: 'http://gedcomx.org/Burial',
      place: {
        original: collapseWhitespace(burialParts.join(', '))
      }
    });
  }
}

/**
 * Get relatives grouped by relationship type
 * 
 * @return {Object} [key=relationship] => Array of persons
 */
function getRelativeGroups() {
  return Array.from(document.querySelectorAll('.data-family .data-filled-user.row .col-sm-6')).reduce(function(groups, column){
    Array.from(column.querySelectorAll('b.label-relation')).forEach(function(label){
      var labelText = label.textContent;
      var list = label.nextElementSibling;
      if(list) {
        groups[labelText.toLowerCase()] = Array.from(list.querySelectorAll('li')).map(processRelative);
      }
    });
    return groups;
  }, {});
}

/**
 * Extract the name, birth year, and death year of a family link.
 * 
 * @param {Element} item 
 * @returns {GedcomX.Person}
 */
function processRelative(item){
  var name = item.querySelector('#familyNameLabel').textContent.replace('*','').trim();
  var url = item.querySelector('a').href;
  var birthLabel = item.querySelector('#familyBirthLabel');
  var deathLabel = item.querySelector('#familyDeathLabel');
  return GedcomX.Person()
    .addSimpleName(name)
    .setId(getMemorialId(url))
    .setIdentifiers({
      'genscrape': getMemorialIdentifier(url)
    })
    .addFact(relativeFact('http://gedcomx.org/Birth', birthLabel ? birthLabel.textContent : null))
    .addFact(relativeFact('http://gedcomx.org/Death', deathLabel ? deathLabel.textContent : null));
}

/**
 * Generate a GedcomX.Fact for a family link
 * 
 * @param {String} type - GedcomX fact type
 * @param {String} date
 * @returns {GedcomX.Fact}
 */
function relativeFact(type, date){
  if(parseInt(date, 10)){
    return {
      type: type,
      date: {
        original: date,
        formal: '+' + date
      }
    };
  }
}

/**
 * Get the ID of a memorial based on the URL
 * 
 * @param {String} url
 * @returns {String}
 */
function getMemorialId(url){
  /**
   * URLs may be in different forms, such as https://new.findagrave.com/memorial/1234
   * or https://new.findagrave.com/cemetery/online/1234. The memorial IDs are in
   * different positions. The best assumption we can make is that the memorial
   * ID will be the first number in the URL starting from the left.
   */
  return url.match(/\d+/)[0];
}

/**
 * Get an Identifier for the memorial based on the URL.
 * 
 * This is not a real URL. It's just a way for us to denote and compare
 * Find A Grave memorials.
 * 
 * @param {String} url
 * @returns {String}
 */
function getMemorialIdentifier(url){
  return 'genscrape://findagrave/memorial:' + getMemorialId(url);
}

/**
 * Collapse all white space by replacing multiple whitespace characters with a
 * single space. Also trim whitespace from the ends.
 * 
 * @param {String} text
 * @return {String}
 */
function collapseWhitespace(text) {
  if(text) {
    return text.trim().replace(/\s\s+/g, ' ');
  }
}