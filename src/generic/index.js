/**
 * Generic, site-agnostic extraction.
 *
 * Runs strategies from most to least reliable, merging their results:
 *   1. schema.org Person data (JSON-LD or microdata)
 *   2. label/value pairs mapped through a multilingual dictionary
 *
 * Earlier strategies win per field; later ones only fill gaps.
 */

var debug = require('debug')('genscrape:generic'),
    GedcomX = require('gedcomx-js'),
    utils = require('../utils'),
    structured = require('./structured'),
    labelvalue = require('./labelvalue'),
    embeddedJson = require('./embedded-json'),
    narrative = require('./narrative'),
    dates = require('./dates');

require('../gedx-extensions');

function merge(base, extra){
  if(!base) return extra;
  ['full', 'given', 'surname'].forEach(function(k){
    if(!base.name.full && !base.name.given && extra.name[k]) base.name[k] = extra.name[k];
  });
  base.gender = base.gender || extra.gender;
  Object.keys(extra.events).forEach(function(type){
    var b = base.events[type], e = extra.events[type];
    if(!b){ base.events[type] = e; return; }
    b.date = precision(e.date) > precision(b.date) ? e.date : b.date;
    b.place = b.place || e.place;
    b.value = b.value || e.value;
  });
  var have = base.relatives.map(function(r){ return r.role + '|' + r.name.toLowerCase(); });
  extra.relatives.forEach(function(r){
    if(have.indexOf(r.role + '|' + r.name.toLowerCase()) === -1) base.relatives.push(r);
  });
  return base;
}

// How many of year/month/day a date string pins down
function precision(date){
  if(!date || /u{2}/i.test(date)) return 0;
  var p = dates.parseDateParts(date);
  return (p.years.length ? 1 : 0) + (p.month ? 1 : 0) + (p.day ? 1 : 0);
}

function recordId(url){
  var params = url.indexOf('?') === -1 ? {} : utils.getQueryParams(url.split('#')[0]);
  var id = params.id || params.record_id || params.pid || params.grave || params.p || params.i;
  if(id) return String(id);
  var path = url.split(/[?#]/)[0].split('/').filter(Boolean);
  for(var i = path.length - 1; i >= 0; i--){
    if(/\d/.test(path[i])) return path[i].replace(/\.\w+$/, '');
  }
  return path.pop() || 'unknown';
}

function makePerson(gedx, name, gender){
  var person = GedcomX.Person({ id: gedx.generateId() });
  if(typeof name === 'string'){
    person.addSimpleName(name);
  } else if(name.given || name.surname){
    person.addNameFromParts({
      'http://gedcomx.org/Given': name.given,
      'http://gedcomx.org/Surname': name.surname
    });
  } else {
    person.addSimpleName(name.full);
  }
  if(gender) person.setGender({ type: 'http://gedcomx.org/' + gender });
  return person;
}

function toGedcomX(rec, document, url){
  var gedx = GedcomX(),
      host = url.replace(/^https?:\/\//, '').split('/')[0].replace(/^www\./, ''),
      id = recordId(url);

  var principal = makePerson(gedx, rec.name, rec.gender);
  principal.setId(id);
  principal.setPrincipal(true);
  principal.setIdentifiers({ genscrape: 'genscrape://' + host + '/' + id });

  Object.keys(rec.events).forEach(function(type){
    var e = rec.events[type];
    if(type === 'Marriage' && rec.relatives.some(function(r){ return r.role === 'spouse'; })) return;
    var fact = GedcomX.Fact({ type: 'http://gedcomx.org/' + type });
    if(e.date) fact.setDate({ original: e.date });
    if(e.place) fact.setPlace({ original: e.place });
    if(e.value) fact.setValue(e.value);
    principal.addFact(fact);
  });
  gedx.addPerson(principal);

  var spouseCount = 0;
  rec.relatives.forEach(function(r){
    var rel = makePerson(gedx, r.name, r.gender);
    gedx.addPerson(rel);
    if(r.role === 'spouse'){
      var couple = GedcomX.Relationship({ type: 'http://gedcomx.org/Couple', person1: principal, person2: rel });
      // A single marriage event belongs to the first spouse
      if(rec.events.Marriage && spouseCount++ === 0){
        couple.addFact(GedcomX.Fact({
          type: 'http://gedcomx.org/Marriage',
          date: rec.events.Marriage.date ? { original: rec.events.Marriage.date } : undefined,
          place: rec.events.Marriage.place ? { original: rec.events.Marriage.place } : undefined
        }));
      }
      gedx.addRelationship(couple);
    } else {
      gedx.addRelationship({
        type: 'http://gedcomx.org/ParentChild',
        person1: r.role === 'parent' ? rel : principal,
        person2: r.role === 'parent' ? principal : rel
      });
    }
  });

  gedx.addAgent(GedcomX.Agent()
    .setId('agent')
    .addName({ lang: 'en', value: host })
    .setHomepage({ resource: url.split('/').slice(0, 3).join('/') }));

  gedx.addSourceDescriptionToAll({
    about: url,
    titles: [{ value: document.title }],
    citations: [{ value: document.title + ' (' + url + ' : accessed ' + utils.getDateString() + ')' }],
    repository: { resource: '#agent' }
  });

  return gedx;
}

/**
 * Pages listing many people (e.g. "p10.htm#i91") point at one of them with the
 * URL fragment. Return a detached element holding just that person's section:
 * from the anchor up to the next anchor of the same shape.
 */
function anchorScope(document, url){
  var hash = (url.split('#')[1] || '').trim();
  if(!hash || !/\w/.test(hash)) return null;
  var anchor = document.getElementById(hash) || document.querySelector('a[name="' + hash.replace(/"/g, '') + '"]');
  if(!anchor) return null;
  var shape = new RegExp('^' + hash.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\d+/g, '\\d+') + '$');
  var isAnchor = function(el){
    return el.nodeType === 1 && ((el.id && shape.test(el.id)) || (el.getAttribute('name') && shape.test(el.getAttribute('name'))));
  };
  var containsOther = function(el){
    if(el.nodeType !== 1) return false;
    if(isAnchor(el) && el !== anchor) return true;
    return Array.prototype.some.call(el.querySelectorAll('[id],a[name]'), function(x){ return x !== anchor && isAnchor(x); });
  };
  // Climb until the parent also holds other people's anchors
  var start = anchor;
  while(start.parentNode && start.parentNode.nodeType === 1 && !containsOther(start.parentNode)) start = start.parentNode;
  if(!start.parentNode || start.parentNode.nodeType !== 1) return null;
  var scope = document.createElement('div');
  for(var n = start; n && !(n !== start && containsOther(n)); n = n.nextSibling){
    scope.appendChild(n.cloneNode(true));
  }
  return scope;
}

/**
 * Extract a person from any page.
 *
 * @param {Document} document
 * @param {String} url
 * @return {{gedx: GedcomX, strategy: String}|null}
 */
function extract(document, url){
  var strategies = [];
  var record = null;

  var root = anchorScope(document, url) || document.body || document.documentElement;
  var text = labelvalue.getText(root);
  [structured, embeddedJson, labelvalue, narrative].forEach(function(s){
    var result = s === narrative ? s.extract(document, text) : s.extract(document, url, root);
    if(result){
      strategies.push(result.strategy);
      record = merge(record, result.record);
    }
  });

  debug('strategies', strategies.join('+') || 'none');
  if(!record) return null;

  return {
    gedx: toGedcomX(record, document, url),
    strategy: strategies.join('+'),
    record: record
  };
}

/**
 * Enough to be worth emitting on an arbitrary page: a name plus at least one
 * dated event or one named relative.
 */
function isUsable(record){
  if(!record || !record.name) return false;
  var hasName = !!(record.name.full || record.name.given || record.name.surname);
  var events = Object.keys(record.events || {}).filter(function(k){ return record.events[k].date; });
  return hasName && (events.length > 0 || (record.relatives || []).length > 0);
}

module.exports = { extract: extract, isUsable: isUsable };
