var debug = require('debug')('genscrape:scrapers:myheritage-record'),
    utils = require('../utils'),
    GedcomX = require('gedcomx-js'),
    HorizontalTable = require('../HorizontalTable'),
    VerticalTable = require('../VerticalTable');

var urls = [
  utils.urlPatternToRegex('https://www.myheritage.com/research/record-*')
];

var events = [
  {
    regex: /^birth$/,
    type: 'http://gedcomx.org/Birth'
  },
  {
    regex: /^christening$/,
    type: 'http://gedcomx.org/Christening'
  },
  {
    regex: /^marriage$/,
    type: 'http://gedcomx.org/Marriage'
  },
  {
    regex: /^immigration$/,
    type: 'http://gedcomx.org/Immigration'
  },
  {
    regex: /^residence$/,
    type: 'http://gedcomx.org/Residence'
  },
  {
    regex: /^death$/,
    type: 'http://gedcomx.org/Death'
  },
  {
    regex: /^burial$/,
    type: 'http://gedcomx.org/Burial'
  }
];

var facts = [
  {
    regex: /^race$/,
    type: 'http://gedcomx.org/Race'
  },
  {
    regex: /^marital status$/,
    type: 'http://gedcomx.org/MaritalStatus'
  },
  {
    regex: /^ethnicity$/,
    type: 'http://gedcomx.org/Ethnicity'
  },
  {
    regex: /^occupation$/,
    type: 'http://gedcomx.org/Occupation'
  },
  {
    regex: /^arrival place$/,
    type: 'http://gedcomx.org/Immigration'
  }
];

var censusDate = null;
var isMarriage = false;

module.exports = function(register){
  register(urls, setup);
};

function setup(emitter) {
  debug('run');

  var gedx = new GedcomX();

  // Create/add the primary person
  var primaryPerson = new GedcomX.Person({
    id: getRecordId(document.location.href),
    principal: true,
    identifiers: {
      'genscrape': getRecordIdentifier(document.location.href)
    }
  });
  gedx.addPerson(primaryPerson);

  // Name(s)
  var names = document.querySelector('.recordTitle').textContent.split('&');
  if (names.length > 1) {
    isMarriage = true;
  }
  for (var i = 0; i < names.length; i++) {
    if (i == 0) {
      primaryPerson.addSimpleName(names[i].trim());
    } else {
      var person = new GedcomX.Person({
        identifiers: {
          'genscrape': getRecordIdentifier(document.location.href)
        }
      });
      person.addSimpleName(names[i].trim());
      gedx.addPerson(person);
    }
  }

  // Loop through primary table
  // We do this because marriages have "sub-facts" about the person in the row(s) above
  var rows = document.querySelectorAll('.recordFieldsTable > tbody > tr');

  var inScopePerson = primaryPerson; // The current person "in scope" as we loop through
  var indented = false;
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var tds = row.querySelectorAll('td');
    var label = tds[0].textContent.toLowerCase().replace(/:$/,'');
    var value = tds[1];

    indented = tds[0].querySelector('div') !== null

    // If we have no indent, set in scope person back to primary person
    if (!indented) {
      inScopePerson = primaryPerson;
    }

    // Gender
    if(/^gender/.test(label)) {
      var genderType = getGender(value.textContent);
      if(genderType){
        inScopePerson.setGender({
          type: genderType
        });
      }
    }

    // Other Names
    if(/birth names/.test(label)) {
      var rawNames = value.innerHTML;
      var names = rawNames.split(/<br ?\/?>/);

      for (var str of names) {
        var name = GedcomX.Name.createFromString(str);
        if (!inScopePerson.hasName(name)) {
          inScopePerson.addName(name);
        }
      }
    }

    // Events
    events.forEach(function(event) {
      if(event.regex.test(label)) {
        var cell = value;
        // Linked places have extra stuff we need to ignore
        var place = cell.querySelector('.event_place .map_callout_link');
        // If it's not a linked place, just get the content
        if (!place) {
          place = cell.querySelector('.event_place');
        }
        var date = cell.querySelector('.event_date');
        if (place || date) {
          var fact = GedcomX.Fact({
            type: event.type
          });
          if (date) {
            fact.setDate({
              original: date.textContent.trim()
            });
          }
          if (place) {
            fact.setPlace({
              original: place.textContent.trim()
            });
          }
          inScopePerson.addFact(fact);
        }
      }
    });

    // Facts
    facts.forEach(function(fact) {
      if(fact.regex.test(label)) {
        inScopePerson.addFact(GedcomX.Fact({
          type: fact.type,
          value: value.textContent.trim()
        }));
      }
    });

    // If we see another person, set them as the in scope person

    // Mother
    if(/^(mother|mother \(implied\))$/.test(label)) {
      var name = value.textContent.trim();
      var person = gedx.addRelativeFromName(inScopePerson, name, 'Parent');
      person.setGender({
        type: 'http://gedcomx.org/Female'
      });
      if (!indented) {
        inScopePerson = person;
      }
    }

    // Father
    if(/^(father|father \(implied\))$/.test(label)) {
      var name = value.textContent.trim();
      var person = gedx.addRelativeFromName(inScopePerson, name, 'Parent');
      person.setGender({
        type: 'http://gedcomx.org/Male'
      });
      if (!indented) {
        inScopePerson = person;
      }
    }

    // Husband
    if(/^(husband|husband \(implied\))$/.test(label)) {
      var name = value.textContent.trim();
      var person;
      // Could be a marriage, so see if this person exists
      if (isMarriage) {
        person = gedx.findPersonByName(GedcomX.Name.createFromString(name));
        if (person && person.id != primaryPerson.id) {
          gedx.addRelationship({
            type: 'http://gedcomx.org/Couple',
            person1: primaryPerson,
            person2: person
          });
        }
      }
      if (!person) {
        person = gedx.addRelativeFromName(inScopePerson, name, 'Couple');
      }
      person.setGender({
        type: 'http://gedcomx.org/Male'
      });
      if (!indented) {
        inScopePerson = person;
      }
    }

    // Wife
    if(/^(wife|wife \(implied\))$/.test(label)) {
      var name = value.textContent.trim();
      var person;
      // Could be a marriage, so see if this person exists
      if (isMarriage) {
        person = gedx.findPersonByName(GedcomX.Name.createFromString(name));
        if (person && person.id != primaryPerson.id) {
          gedx.addRelationship({
            type: 'http://gedcomx.org/Couple',
            person1: primaryPerson,
            person2: person
          });
        }
      }
      if (!person) {
        person = gedx.addRelativeFromName(inScopePerson, name, 'Couple');
      }
      person.setGender({
        type: 'http://gedcomx.org/Female'
      });
      if (!indented) {
        inScopePerson = person;
      }
    }

    // Daughter
    if(/^(daughter|daughter \(implied\))$/.test(label)) {
      var name = value.textContent.trim();
      var person = gedx.addRelativeFromName(inScopePerson, name, 'Child');
      person.setGender({
        type: 'http://gedcomx.org/Female'
      });
      if (!indented) {
        inScopePerson = person;
      }
    }

    // Son
    if(/^(son|son \(implied\))$/.test(label)) {
      var name = value.textContent.trim();
      var person = gedx.addRelativeFromName(inScopePerson, name, 'Child');
      person.setGender({
        type: 'http://gedcomx.org/Male'
      });
      if (!indented) {
        inScopePerson = person;
      }
    }

    // Children
    if(/^(children|children \(implied\))$/.test(label)) {
      var rawNames = value.innerHTML;
      var names = rawNames.split(/<br ?\/?>/);
      for (var str of names) {
        var el = document.createElement('div');
        el.innerHTML = str;
        var name = el.textContent.trim();
        gedx.addRelativeFromName(inScopePerson, name, 'Child');
      }
      // TODO create relationship to father/mother if they are also set
    }

    // Siblings
    if(/^(siblings|siblings \(implied\))$/.test(label)) {
      var parents = gedx.getPersonsParents(inScopePerson);
      var rawNames = value.innerHTML;
      var names = rawNames.split(/<br ?\/?>/);
      for (var str of names) {
        var el = document.createElement('div');
        el.innerHTML = str;
        var name = el.textContent.trim();
        var person = new GedcomX.Person({
          identifiers: {
            'genscrape': getRecordIdentifier(document.location.href)
          }
        });
        person.addSimpleName(name.trim());
        gedx.addPerson(person);
        for (var parent of parents) {
          gedx.addRelationship({
            type: 'http://gedcomx.org/ParentChild',
            person1: parent,
            person2: person
          });
        }
      }
    }
  }

  // Additional Tables
  var tables = document.querySelectorAll('.recordFieldsTable');
  // Reminder: tables is a NodeList, not an array
  for (var i = 0; i < tables.length; i++) {
    if (i == 0) continue;
    var additionalTable = tables[i];

    // Relatives table
    var title = additionalTable.querySelector('.recordSectionTitle');
    if (title && title.textContent.toLowerCase() == 'relatives') {
      var relatives = new VerticalTable(additionalTable.querySelector('table'), {
        labelMapper: function(label){
          return label.toLowerCase().trim();
        },
        valueMapper: function(cell){
          var a = cell.querySelector('a');
          return {
            text: cell.textContent.trim(),
            href: a ? a.href : ''
          };
        }
      });

      relatives.getRows().forEach(function(row) {
        // If there is no relation, return
        if (!row.relation.text.trim()) return;

        var name = GedcomX.Name.createFromString(row.name.text);
        var person = gedx.findPersonByName(name);
        var personId = getRecordId(row.name.href);
        var identifiers = {
          'genscrape': getRecordIdentifier(row.name.href)
        };

        if (person) {
          // Update their IDs
          gedx.updatePersonsID(person.id, personId);
          person.setIdentifiers(identifiers);
        } else {
          // Add person
          person = new GedcomX.Person({
            id: getRecordId(row.name.href),
            identifiers: identifiers
          });
          person.addSimpleName(row.name.text);
          gedx.addPerson(person);
        }

        // Update their birth/death information
        if (row.birth && row.birth.text) {
          person.addFact(GedcomX.Fact({
            type: 'http://gedcomx.org/Birth',
            date: {
              original: row.birth.text.trim()
            }
          }));
        }
        if (row.death && row.death.text) {
          person.addFact(GedcomX.Fact({
            type: 'http://gedcomx.org/Death',
            date: {
              original: row.death.text.trim()
            }
          }));
        }

        // Add relationships
        if(/^(husband|wife)/.test(row.relation.text.toLowerCase())) {
          gedx.addRelationship({
            type: 'http://gedcomx.org/Couple',
            person1: primaryPerson,
            person2: person
          });
        }
        if(/^(son|daughter)/.test(row.relation.text.toLowerCase())) {
          gedx.addRelationship({
            type: 'http://gedcomx.org/ParentChild',
            person1: primaryPerson,
            person2: person
          });
        }
        if(/^(mother|father)/.test(row.relation.text.toLowerCase())) {
          gedx.addRelationship({
            type: 'http://gedcomx.org/ParentChild',
            person1: person,
            person2: primaryPerson
          });
        }
      });
    }

    // Census table
    if (title && title.textContent.toLowerCase() == 'census') {
      var census = new HorizontalTable(additionalTable.querySelector('table'), {
        // rowSelector: 'tbody > tr',
        labelMapper: function(label) {
          return label.toLowerCase().replace(/:$/,'');
        }
      });
      if (census.hasMatch(/date/)) {
        censusDate = census.getMatchText(/date/).trim();
      }
    }
  }

  // Household table
  var household = document.querySelector('.recordSection .groupTable');
  if (household !== null) {
    var householdMembers = new VerticalTable(household, {
      labelMapper: function(label){
        return label.toLowerCase().trim();
      },
      valueMapper: function(cell){
        var a = cell.querySelector('a');
        return {
          text: cell.textContent.trim(),
          href: a ? a.href : ''
        };
      }
    });


    householdMembers.getRows().forEach(function(row) {
      var personId = getRecordId(row.name.href);
      var name = GedcomX.Name.createFromString(row.name.text);
      // Try finding by id first
      var person = gedx.getPersonById(personId);
      if (person === undefined) {
        person = gedx.findPersonByName(name);
      }
      var identifiers = {
        'genscrape': getRecordIdentifier(row.name.href)
      };

      if (person) {
        // Update their IDs
        gedx.updatePersonsID(person.id, personId);
        person.setIdentifiers(identifiers);
      } else {
        // Add person
        person = new GedcomX.Person({
          id: getRecordId(row.name.href),
          identifiers: identifiers
        });
        person.addSimpleName(row.name.text);
        gedx.addPerson(person);
      }

      // Update their birth date based on their age (if not set)
      if (censusDate && row.age) {
        // Only set if we don't have a birth event
        if (person.getFactsByType('http://gedcomx.org/Birth').length === 0) {
          var rawAge = row.age.text.trim();
          var year = rawAge.split(/ +/)[0];
          var age = censusDate - year;
          person.addFact(GedcomX.Fact({
            type: 'http://gedcomx.org/Birth',
            date: {
              original: 'About ' + age
            }
          }));
        }
      }

      // If we are looking at the primary person, we're done
      if (person.id == primaryPerson.id) return;

      // Update the gender
      var relation = row['relation to head'].text.toLowerCase();

      if (/^(wife|daughter|mother|aunt)/.test(relation)) {
        person.setGender({
          type: 'http://gedcomx.org/Female'
        });
      }
      if (/^(husband|son|father|uncle)/.test(relation)) {
        person.setGender({
          type: 'http://gedcomx.org/Male'
        });
      }

      // Note: We have all of the relations from the main table above
    });
  }


  // Agent
  var agent = GedcomX.Agent()
      .setId('agent')
      .addName({
        lang: 'en',
        value: 'MyHeritage'
      })
      .setHomepage({
        resource: 'https://www.myheritage.com'
      });
  gedx.addAgent(agent);

  // Source Citation/Description
  var source = GedcomX.SourceDescription()
    .setAbout(document.location.href)
    .addTitle({
      value: document.querySelector('.collection_title').textContent.trim()
    })
    .addCitation({
      value: 'MyHeritage, database and images (https://www.myheritage.com : accessed ' + utils.getDateString() + ')'
        + ', Record #' + getRecordId(document.location.href) + ' for ' + document.title + '.'
    })
    .setRepository({resource: '#agent'});
  gedx.addSourceDescriptionToAll(source);

  debug('data');
  emitter.emit('data', gedx);
}

function getRecordId(url) {
  var parts = url.match(/\/record-(\d+)-([^\/]+)\//);
  return parts[1] + ':' + parts[2];
}

function getRecordIdentifier(url) {
  return 'genscrape://myheritage:record/' + getRecordId(url);
}

function getGender(raw){
  var gender = (raw.length > 0 ) ? raw.toLowerCase()[0] : '';

  switch(gender) {
    case 'm':
      return 'http://gedcomx.org/Male';
    case 'f':
      return 'http://gedcomx.org/Female';
  }
}
