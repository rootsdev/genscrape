var debug = require('debug')('genscrape:scrapers:abmc'),
    utils = require('../utils'),
    GedcomX = require('gedcomx-js');

var urls = [
  utils.urlPatternToRegex("https://www.abmc.gov/profile/*"),
  utils.urlPatternToRegex("https://abmc.gov/profile/*")
];

module.exports = function(register){
  register(urls, run);
};

// Words that make up a military rank prefix on the page title
var rankWords = [
  'private', 'first', 'second', 'class', 'corporal', 'sergeant', 'staff', 'technical',
  'master', 'gunnery', 'lance', 'major', 'colonel', 'lieutenant', 'captain', 'general',
  'brigadier', 'admiral', 'rear', 'vice', 'commander', 'ensign', 'seaman', 'apprentice',
  'petty', 'officer', 'chief', 'warrant', 'flight', 'pilot', 'airman', 'specialist',
  'cadet', 'chaplain', 'junior', 'grade', 'senior', 'fireman', 'musician', 'cook',
  'mechanic', 'bugler', 'wagoner', 'saddler', 'sergeant-major', 'quartermaster',
  'machinist\'s', 'mate', 'coxswain', 'yeoman', 'radioman', 'storekeeper', 'surgeon',
  'of', 'the', 'and', 'army', 'fleet', 'colonel', 'second-class', 'first-class'
];

function run(emitter){

  debug('run');

  var $heading = document.querySelector('.usa-card__heading');

  if(!$heading){
    return emitter.emit('noData');
  }

  var slug = getRecordId(document.location.href),
      fullTitle = text($heading),
      nameParts = splitRank(fullTitle),
      gedx = new GedcomX(),
      person = GedcomX.Person({
        id: slug,
        principal: true,
        identifiers: {
          'genscrape': 'genscrape://abmc/' + slug
        }
      });

  // Name
  person.addSimpleName(nameParts.name);

  // Categories: "Died in Service, Manila American Cemetery, U.S. Army, Philippines, World War II"
  var categories = text(document.querySelector('.abmc-profile-card__categories'))
        .split(/\s*,\s*/),
      cemetery,
      branch,
      war;
  categories.forEach(function(category){
    if(/(Cemetery|Memorial)$/i.test(category) && !cemetery){
      cemetery = category;
    } else if(/^U\.S\./.test(category) && !branch){
      branch = category;
    } else if(/^(World War|Korean War|Vietnam War|Spanish)/i.test(category)){
      war = category;
    }
  });

  // Fields from the list: Unit, Date of Birth, Hometown, etc
  var fields = {};
  Array.prototype.forEach.call(document.querySelectorAll('.usa-card__body li'), function($li){
    var $label = $li.querySelector('strong');
    if($label){
      var label = text($label).replace(/:$/, '');
      fields[label] = text($li).substr(text($label).length).trim();
    }
  });

  addEvent(person, 'http://gedcomx.org/Birth', fields['Date of Birth']);
  addEvent(person, 'http://gedcomx.org/Death', fields['Date of Death'], fields['Place of Death']);

  var burialPlace = fields['Cemetery'] || cemetery;
  if(burialPlace){
    person.addFact({
      type: 'http://gedcomx.org/Burial',
      place: {original: burialPlace}
    });
  }

  if(fields['Hometown']){
    person.addFact({
      type: 'http://gedcomx.org/Residence',
      place: {original: fields['Hometown']}
    });
  }

  // Military service
  var service = [];
  if(nameParts.rank){
    service.push(nameParts.rank);
  }
  if(fields['Unit']){
    service.push(fields['Unit']);
  }
  if(branch){
    service.push(branch);
  }
  if(war){
    service.push(war);
  }
  if(service.length){
    person.addFact({
      type: 'http://gedcomx.org/MilitaryService',
      value: service.join('; ')
    });
  }

  if(fields['Awards']){
    fields['Awards'].split(/\s*,\s*/).forEach(function(award){
      if(award){
        person.addFact({
          type: 'http://gedcomx.org/MilitaryAward',
          value: award
        });
      }
    });
  }

  gedx.addPerson(person);

  // Agent
  gedx.addAgent(GedcomX.Agent()
    .setId('agent')
    .addName({
      lang: 'en',
      value: 'American Battle Monuments Commission'
    })
    .setHomepage({
      resource: 'https://www.abmc.gov'
    }));

  // SourceDescription
  var title = document.title.replace(/\s*-\s*American Battle Monuments Commission.*$/, '');
  gedx.addSourceDescriptionToAll({
    about: document.location.href,
    titles: [
      {
        value: title + ' - American Battle Monuments Commission'
      }
    ],
    citations: [
      {
        value: 'American Battle Monuments Commission, "' + title + '" (' + document.location.href
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

function addEvent(person, type, date, place){
  if(date || place){
    var fact = GedcomX.Fact({type: type});
    if(date){
      fact.setDate({original: date});
    }
    if(place){
      fact.setPlace({original: place});
    }
    person.addFact(fact);
  }
}

/**
 * Split "Staff Sergeant James Calven Thomas" into rank and name. At least two
 * words are always left for the name.
 *
 * @param {String} title
 * @return {Object} {rank, name}
 */
function splitRank(title){
  var words = title.split(' '),
      i = 0;
  while(i < words.length - 2 && rankWords.indexOf(words[i].toLowerCase()) !== -1){
    i++;
  }
  return {
    rank: words.slice(0, i).join(' '),
    name: words.slice(i).join(' ')
  };
}

/**
 * Get the profile slug from the URL
 *
 * @param {String} url
 * @return {String}
 */
function getRecordId(url){
  var match = url.match(/\/profile\/([^\/?#]+)/);
  return match ? match[1] : undefined;
}
