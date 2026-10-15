var debug = require('debug')('genscrape:scrapers:awm'),
    utils = require('../utils'),
    GedcomX = require('gedcomx-js');

var urls = [
  utils.urlPatternToRegex("https://www.awm.gov.au/collection/R*")
];

module.exports = function(register){
  register(urls, run);
};

function run(emitter){

  debug('run');

  var $name = document.querySelector('h1.title__heading span'),
      fields = readFields();

  if(!$name || !fields['Date of Death']){
    return emitter.emit('noData');
  }

  var id = getRecordId(document.location.href),
      name = text($name),
      gedx = new GedcomX(),
      person = GedcomX.Person({
        id: id,
        principal: true,
        identifiers: {
          'genscrape': 'genscrape://awm/' + id
        }
      });

  person.addSimpleName(name);

  // Death
  var death = GedcomX.Fact({
    type: 'http://gedcomx.org/Death',
    date: {original: fields['Date of Death'].replace(/^0/, '')}
  });
  if(fields['Place of Death']){
    death.setPlace({original: fields['Place of Death']});
  }
  if(fields['Cause of Death']){
    death.setValue(fields['Cause of Death']);
  }
  person.addFact(death);

  // Burial or commemoration
  if(fields['Cemetery or Memorial Details']){
    person.addFact({
      type: 'http://gedcomx.org/Burial',
      place: {original: fields['Cemetery or Memorial Details']}
    });
  }

  // Residence
  if(fields['Place of Association']){
    person.addFact({
      type: 'http://gedcomx.org/Residence',
      place: {original: fields['Place of Association']}
    });
  }

  // Military service
  var service = [];
  ['Conflict/Operation', 'Rank', 'Unit', 'Service'].forEach(function(key){
    if(fields[key]){
      service.push(fields[key]);
    }
  });
  if(fields['Service number']){
    service.push('Service number ' + fields['Service number']);
  }
  if(fields['Age at Death']){
    service.push('Age at death ' + fields['Age at Death']);
  }
  if(service.length){
    person.addFact({
      type: 'http://gedcomx.org/MilitaryService',
      value: service.join('; ')
    });
  }

  gedx.addPerson(person);

  // Agent
  gedx.addAgent(GedcomX.Agent()
    .setId('agent')
    .addName({
      lang: 'en',
      value: 'Australian War Memorial'
    })
    .setHomepage({
      resource: 'https://www.awm.gov.au'
    }));

  // SourceDescription
  var title = 'Roll of Honour: ' + name;
  gedx.addSourceDescriptionToAll({
    about: document.location.href,
    titles: [
      {
        value: title + ' - Australian War Memorial'
      }
    ],
    citations: [
      {
        value: 'Australian War Memorial, "' + title + '" (' + document.location.href
          + ' : accessed ' + utils.getDateString() + ').'
      }
    ],
    repository: {
      resource: '#agent'
    }
  });

  emitter.emit('data', gedx);
}

function text($el){
  return $el ? $el.textContent.replace(/\s+/g, ' ').trim() : '';
}

/**
 * Read the rows of the details table
 */
function readFields(){
  var fields = {};
  Array.prototype.forEach.call(document.querySelectorAll('.entry-content table tr'), function($row){
    var $th = $row.querySelector('th'),
        $td = $row.querySelector('td');
    if($th && $td){
      fields[text($th)] = text($td);
    }
  });
  return fields;
}

function getRecordId(url){
  var match = url.match(/\/collection\/(R\d+)/);
  return match ? match[1] : undefined;
}
