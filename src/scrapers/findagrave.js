var debug = require('debug')('genscrape:scrapers:findagrave'),
    utils = require('../utils'),
    GedcomX = require('gedcomx-js');

var urls = [
  utils.urlPatternToRegex("https://www.findagrave.com/cgi-bin/fg.cgi*")
];

module.exports = function(register){
  register(urls, function(emitter){
    var page = utils.getQueryParams()['page'];
    if(page === 'gr' || page === 'sh') {
      run(emitter);
    } else {
      emitter.emit('noMatch');
    }
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
  
  primaryPerson.addName(getName(document.querySelector('.plus2').textContent));
  
  primaryPerson.addFact(getFact('http://gedcomx.org/Birth', 1, 2));
  primaryPerson.addFact(getFact('http://gedcomx.org/Death', 2, 2));
  
  // Burial is ugly. We just want some text nodes: the third, which is the cemetary
  // name, and evens after the 4th except for the plot line
  var burialCell = xpath(5, 1),
      burialParts = [];
  Array.from(burialCell.childNodes).forEach(function(node, i){
    if(i === 3 || (i > 4 && i % 2 == 0)){
      if(node.textContent.indexOf('Plot:') === -1){
        burialParts.push(node.textContent);
      }
    }
  });
  if(burialParts.length){
    primaryPerson.addFact({
      type: 'http://gedcomx.org/Burial',
      place: {
        original: burialParts.join(', ')
      }
    });
  }
  
  var family = getFamilyLinks();
  
  // When processing the family we can't make any assumptions about relationship
  // between the family members. I.e. we don't know whether the parents should
  // have a couple relationship, whether siblings should have a parent-child
  // relationship with the parents, and whether children should have a
  // parent-child relationship with the spouses. This also means that siblings
  // won't be referenced by any relationship but will be included as persons
  // in the document.
  
  family.parents.forEach(function(parent){
    gedx.addPerson(parent);
    gedx.addRelationship({
      type: 'http://gedcomx.org/ParentChild',
      person1: parent,
      person2: primaryPerson
    });
  });
  
  family.spouses.forEach(function(spouse){
    gedx.addPerson(spouse);
    gedx.addRelationship({
      type: 'http://gedcomx.org/Couple',
      person1: primaryPerson,
      person2: spouse
    });
  });
  
  family.children.forEach(function(child){
    gedx.addPerson(child);
    gedx.addRelationship({
      type: 'http://gedcomx.org/ParentChild',
      person1: primaryPerson,
      person2: child
    });
  });
  
  family.siblings.forEach(function(sibling){
    gedx.addPerson(sibling);
  });
  
  // Agent
  var agent = GedcomX.Agent({
    id: 'agent',
    names: [{
      lang: 'en',
      value: 'Find A Grave'
    }],
    homepage: {
      resource: 'https://www.findagrave.com'
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
        value: 'Find A Grave, database and images (http://findagrave.com : accessed ' + utils.getDateString() + ')'
          + ', memorial #' + getMemorialId(document.location.href) + ' for ' + document.title + '.'
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
 * @param {String} nameText
 * @returns {GedcomX.Name}
 */
function getName(nameText){
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

/**
 * Get a birth or death fact
 * 
 * @param {String} type - The GedcomX type
 * @param {Integer} row - param for xpath()
 * @param {Integer} cell - param for xpath()
 * @returns {GedcomX.Fact}
 */
function getFact(type, row, cell){
  var $cell = xpath(row, cell),
      parts, date, place, fact;
  if($cell){
    parts = $cell.innerHTML.split('<br>');
    
    if(parts.length === 1){
      if(/\d{4}/.test(parts[0])){
        date = parts[0];
      }
    }
    else if(parts.length >= 2){
      date = parts.shift();
      place = parts.join(', ');
    }
    
    if(date || place){
      fact = {
        type: type
      };
      if(date){
        fact.date = {
          original: date
        };
      }
      if(place){
        fact.place = {
          original: place
        };
      }
      return GedcomX.Fact(fact);
    }
  }
}

/**
 * Get the family links. The relationship type arrays are filled with GedcomX.Person objects
 * 
 * @returns {Object} Format { parents: [], spouses: [], siblings: [], children: [] }
 */
function getFamilyLinks(){
  var family = {
        parents: [],
        spouses: [],
        siblings: [],
        children: []
      }, 
      bioCell = xpath(3, 1),
      familyLinks = false,
      relType, currentNode, currentText, currentNodeName;
  
  for(var i = 0; i < bioCell.childNodes.length; i++){
    currentNode = bioCell.childNodes[i];
    currentText = currentNode.textContent.trim();
    
    // Skip empty nodes
    if(!currentText){
      continue;
    }
    
    if(familyLinks){
      
      if(currentText === 'Parents:'){
        relType = 'parents';
        continue;
      }
      else if(currentText === 'Spouse:' || currentText === 'Spouses:'){
        relType = 'spouses';
        continue;
      }
      else if(currentText === 'Children:'){
        relType = 'children';
        continue;
      }
      else if(currentText === 'Sibling:'){
        relType = 'siblings';
        continue;
      }
      
      // Skip this fake link
      if(currentText === '*Calculated relationship'){
        break;
      }
      
      // At this point, any <a> or <font> tags should be people
      currentNodeName = currentNode.nodeName;
      if(currentNodeName === 'A' || currentNodeName === 'FONT'){
        family[relType].push(processFamilyLink(currentText, currentNode.href));
      }
      
    }
    
    else if(currentText.indexOf('Family links:') === 0){
      familyLinks = true;
    }
  }
  
  return family;
}

/**
 * Extract the name, birth year, and death year of a family link.
 * 
 * @param {String} linkText
 * @param {String} url
 * @returns {GedcomX.Person}
 */
function processFamilyLink(linkText, url){
  var matches = linkText.match(/^([\w\s\.]+)( \((\w{4}) - (\w{4})\))?$/);
  if(matches){
    var data = {
      name: matches[1],
      birthYear: matches[3],
      deathYear: matches[4]
    };
    return GedcomX.Person()
      .addSimpleName(data.name)
      .setId(getMemorialId(url))
      .setIdentifiers({
        'genscrape': getMemorialIdentifier(url)
      })
      .addFact(familyLinkFact('http://gedcomx.org/Birth', data.birthYear))
      .addFact(familyLinkFact('http://gedcomx.org/Death', data.deathYear));
  } else {
    console.error('Find A Grave: Unable to parse family link: ' + linkText);
  }
}

/**
 * Generate a GedcomX.Fact for a family link
 * 
 * @param {String} type - GedcomX fact type
 * @param {String} date
 * @returns {GedcomX.Fact}
 */
function familyLinkFact(type, date){
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
 * Execute an XPath query. Account for different possible locations. Return
 * the value we find first.
 * 
 * Only XPath can wrangle the hideous Find A Grave DOM.
 * 
 * @param {Integer} row
 * @param {Integer} cell
 * @returns {HTMLElement}
 */
function xpath(row, cell){
  var result1 = document.evaluate('/html/body/table/tbody/tr/td[3]/table/tbody/tr[3]/td[1]/table/tbody/tr/td/table/tbody/tr/td/table/tbody/tr[' + row + ']/td[' + cell + ']', document, null, window.XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  var result2 = document.evaluate('/html/body/table/tbody/tr/td[3]/table/tbody/tr[4]/td[1]/table/tbody/tr/td/table/tbody/tr/td/table/tbody/tr[' + row + ']/td[' + cell + ']', document, null, window.XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  return result1.snapshotLength ? result1.snapshotItem(0) : result2.snapshotItem(0);
}

/**
 * Get the ID of a memorial based on the URL
 * 
 * @param {String} url
 * @returns {String}
 */
function getMemorialId(url){
  return utils.getQueryParams(url).GRid;
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