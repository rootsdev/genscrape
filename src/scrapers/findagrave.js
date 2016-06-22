var debug = require('debug')('genscrape:scrapers:findagrave'),
    utils = require('../utils'),
    GedcomX = require('gedcomx-js');

var urls = [
  utils.urlPatternToRegex("http://www.findagrave.com/cgi-bin/fg.cgi*")
];

module.exports = function(register){
  register(urls, function(emitter){
    if( utils.getQueryParams()['page'] == 'gr' ) {
      run(emitter);
    } else {
      emitter.emit('noMatch');
    }
  });
};

function run(emitter){
  debug('run');
  
  var gedx = GedcomX(),
      primaryPerson = GedcomX.Person();
  
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
  
  // TODO: relationships
  
  debug('data', gedx);
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