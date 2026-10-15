/**
 * Strategy 2: find label/value pairs anywhere on the page (tables, definition
 * lists, "Label: value" lines, label/value element pairs) and map the labels
 * through the multilingual dictionary in labels.js.
 */

var debug = require('debug')('genscrape:generic:labelvalue'),
    labels = require('./labels'),
    dates = require('./dates');

var SKIP = 'script,style,noscript,template,nav,footer,form,select,option,input,textarea,button,svg,iframe';
var BLOCK = /^(address|article|aside|blockquote|dd|div|dl|dt|fieldset|figure|h[1-6]|header|hr|li|main|ol|p|pre|section|table|tbody|thead|tfoot|tr|td|th|ul|caption)$/;

/**
 * textContent, but with line breaks for <br> and block elements, and with
 * skipped elements left out.
 */
function getText(el){
  var out = '';
  (function walk(node){
    if(node.nodeType === 3){ out += node.data; return; }
    if(node.nodeType !== 1) return;
    var tag = node.tagName.toLowerCase();
    if(tag === 'br'){ out += '\n'; return; }
    if(matches(node, SKIP)) return;
    var block = BLOCK.test(tag);
    if(block) out += '\n';
    for(var c = node.firstChild; c; c = c.nextSibling) walk(c);
    if(block) out += '\n';
  })(el);
  return out.replace(/[ \t ]+/g, ' ').replace(/ *\n[\s]*/g, '\n').trim();
}

function oneLine(s){
  return (s || '').replace(/\s+/g, ' ').trim();
}

function matches(el, selector){
  var fn = el.matches || el.webkitMatchesSelector || el.msMatchesSelector;
  return !!(fn && fn.call(el, selector));
}

// Element.closest isn't available everywhere (old jsdom, old browsers)
function closest(el, selector){
  for(; el && el.nodeType === 1; el = el.parentNode){
    if(matches(el, selector)) return el;
  }
  return null;
}

function skipped(el){
  return !!closest(el, SKIP);
}

function hasBlockChild(el){
  for(var i = 0; i < el.children.length; i++){
    if(BLOCK.test(el.children[i].tagName.toLowerCase())) return true;
  }
  return false;
}

/**
 * Collect candidate pairs. Lower priority number wins when the same field
 * appears more than once; ties go to document order.
 */
function collectPairs(document, root){
  var pairs = [], order = 0;
  root = root || document.body || document.documentElement;
  pairs.household = [];

  function add(label, value, priority){
    label = oneLine(label).replace(/[:：]\s*$/, '');
    value = (value || '').trim();
    if(!label || !value || label.length > 50 || value.length > 600 || labels.isNullish(value)) return;
    if(value.length < 40 && labels.fieldForLabel(value)) return; // a header bled into the value
    var field = labels.fieldForLabel(label);
    if(field) pairs.push({ field: field, label: label, value: value, priority: priority, order: order++ });
  }

  // 0. Horizontal tables: a header row of labels, one data row per record/person.
  //    The principal row is the visually marked one (bold/highlighted/"found"), else the first.
  Array.prototype.forEach.call(root.querySelectorAll('table'), function(table){
    if(skipped(table)) return;
    var headerCells = Array.prototype.slice.call(table.querySelectorAll('thead th, thead td'));
    var rows = Array.prototype.filter.call(table.querySelectorAll('tr'), function(tr){ return !closest(tr, 'thead'); });
    if(!headerCells.length && rows.length > 1){
      var firstCells = Array.prototype.filter.call(rows[0].children, function(c){ return /^(td|th)$/i.test(c.tagName); });
      if(firstCells.length > 2 && firstCells.every(function(c){ return c.tagName.toLowerCase() === 'th'; })){
        headerCells = firstCells;
        rows = rows.slice(1);
      }
    }
    var headers = headerCells.map(function(c){ return oneLine(getText(c)); });
    var mapped = headers.filter(function(h){ return labels.fieldForLabel(h); }).length;
    if(headers.length < 3 || mapped < 2) return;

    var data = rows.map(function(tr){
      return Array.prototype.filter.call(tr.children, function(c){ return /^(td|th)$/i.test(c.tagName); });
    }).filter(function(cells){ return Math.abs(cells.length - headers.length) <= 1; });
    if(!data.length) return;

    var marked = data.filter(function(cells){
      var html = cells.map(function(c){ return (c.getAttribute('class') || '') + ' ' + c.innerHTML; }).join(' ').toLowerCase();
      return /bold|semibold|highlight|selected|current|principal|primary|found in your search|<strong|<b>/.test(html);
    });
    var principal = marked.length === 1 ? marked[0] : data[0];
    var cellText = function(c){
      // Screen-reader-only annotations aren't data
      var clone = c.cloneNode(true);
      Array.prototype.forEach.call(clone.querySelectorAll('.accessibility,.sr-only,.visually-hidden'), function(x){ x.parentNode.removeChild(x); });
      return oneLine(getText(clone));
    };
    headers.forEach(function(h, i){ if(principal[i]) add(h, cellText(principal[i]), 0); });

    // Other rows become household members
    if(data.length > 1){
      data.forEach(function(cells){
        if(cells === principal) return;
        var member = {};
        headers.forEach(function(h, i){
          var f = labels.fieldForLabel(h);
          if(f && cells[i] && member[f] === undefined) member[f] = cellText(cells[i]);
        });
        pairs.household.push(member);
      });
    }
  });

  // 1. Table rows: <th|td>label</th><td>value</td>
  Array.prototype.forEach.call(root.querySelectorAll('tr'), function(tr){
    if(skipped(tr)) return;
    var cells = Array.prototype.filter.call(tr.children, function(c){ return /^(td|th)$/i.test(c.tagName); });
    if(cells.length >= 2){
      add(getText(cells[0]), cells.slice(1).map(getText).filter(Boolean).join('\n'), 1);
    }
  });

  // 2. Definition lists
  Array.prototype.forEach.call(root.querySelectorAll('dt'), function(dt){
    if(skipped(dt)) return;
    var values = [], sib = dt.nextElementSibling;
    while(sib && sib.tagName.toLowerCase() === 'dd'){ values.push(getText(sib)); sib = sib.nextElementSibling; }
    add(getText(dt), values.join('\n'), 1);
  });

  // 3. Elements styled as label/value pairs (class names like "label", "key", "term")
  Array.prototype.forEach.call(root.querySelectorAll('[class]'), function(el){
    if(skipped(el)) return;
    var cls = ' ' + (el.getAttribute('class') || '').toLowerCase().replace(/[-_]/g, ' ') + ' ';
    if(/ (label|key|term|field label|data label|fact label|title) /.test(cls) && el.nextElementSibling && !hasBlockChild(el)){
      add(getText(el), getText(el.nextElementSibling), 2);
    }
  });

  // 4. "Label: value" lines inside leaf blocks
  Array.prototype.forEach.call(root.querySelectorAll('p,li,div,span,td,dd'), function(el){
    if(skipped(el) || hasBlockChild(el)) return;
    getText(el).split('\n').forEach(function(line){
      var m = /^\s*([^:\n]{2,40}?)\s*[:：]\s*(\S[^\n]*)$/.exec(line);
      if(m) add(m[1], m[2], 3);
    });
  });

  // 5. A short element whose whole text is a known label, followed by its value
  Array.prototype.forEach.call(root.querySelectorAll('b,strong,em,span,label,h2,h3,h4,h5,h6,dt,th,div'), function(el){
    if(skipped(el) || el.children.length > 1) return;
    var t = oneLine(el.textContent);
    if(!t || t.length > 40) return;
    var sib = el.nextElementSibling, value = '';
    if(sib){
      value = getText(sib);
    } else if(el.nextSibling && el.nextSibling.nodeType === 3){
      value = el.nextSibling.data;
    }
    if(value && value.length < 300) add(t, value, 4);
  });

  // 6. Page text lines: a line that is only a label, value on the following line(s).
  //    List fields (parents, spouses, children) take lines until the next section.
  var lines = getText(root).split('\n').map(oneLine).filter(Boolean);
  lines.forEach(function(line, i){
    var label = line.replace(/\s*[:：]$/, '').replace(/^(children|child|parents|spouses?)\s+(of|with|by)\s+.*$/i, '$1');
    if(label.length > 40 || /\d/.test(label)) return;
    var field = labels.fieldForLabel(label);
    if(!field || !lines[i + 1]) return;
    if(LIST_FIELDS.test(field)){
      var values = [];
      for(var j = i + 1; j < lines.length && j <= i + 15 && !isSectionLine(lines[j]); j++) values.push(lines[j]);
      add(label, values.join('\n'), 4);
    } else if(!isSectionLine(lines[i + 1])){
      add(label, lines[i + 1], 4);
    }
  });

  // 7. Event lines without a colon: "Born 22 Feb 1732 - Pope's Creek", "d. 1863"
  lines.forEach(function(line){
    var m = EVENT_LINE.exec(line);
    if(m && dates.findDate(m[2])){
      var word = m[1].toLowerCase().replace(/\.$/, '');
      add(ABBREV[word] || word, m[2], 5);
    }
  });

  // 8. Timeline lines: "13 September 1863 birth: Langenburg, Germany"
  lines.forEach(function(line){
    var d = dates.findDate(line);
    if(!d || d.index > 3) return;
    var m = /^\s*([^\d:]{3,30}?)\s*[:\-–]\s*(.*)$/.exec(line.substr(d.index + d.text.length));
    if(!m || /^(son|daughter|spouse|wife|husband|father|mother|sibling|brother|sister)\b/i.test(m[1])) return;
    var place = m[2].split(/,?\s*[♂♀]|\s+(?:with|to|and)\s+[A-Z]/)[0];
    var who = /[♂♀]\s*(.+)$/.exec(m[2]);
    if(/^child (birth|born)/i.test(m[1])){
      if(who) add('children', who[1], 5);
      return;
    }
    add(m[1], d.text + ' ' + place, 5);
    if(who && labels.fieldForLabel(m[1]) === 'marriage') add('spouse', who[1], 5);
  });

  return pairs;
}

var HEAD = /^(head|hoofd|chef|hf|husfar|husbonde|husmor|hm)/,
    SPOUSE = /^(wife|husband|spouse|w|hu|echtgeno|epouse|epoux|kone|hustru|mann|ehefrau|ehemann)/,
    CHILD = /^(son|dau|daughter|child|s|d|sonn|datter|zoon|dochter|fils|fille|sohn|tochter|barn)/,
    PARENT = /^(father|mother|fader|moder|far|mor|vader|moeder)/;

/**
 * Role of a household member relative to the principal, given both people's
 * relationship to the head of household.
 */
function householdRole(mine, theirs){
  var meHead = !mine || HEAD.test(mine);
  if(meHead){
    if(SPOUSE.test(theirs)) return 'spouse';
    if(CHILD.test(theirs)) return 'child';
    if(PARENT.test(theirs)) return 'parent';
    return null;
  }
  if(SPOUSE.test(mine)){
    if(HEAD.test(theirs)) return 'spouse';
    if(CHILD.test(theirs)) return 'child';
    return null;
  }
  if(CHILD.test(mine)){
    if(HEAD.test(theirs) || SPOUSE.test(theirs)) return 'parent';
  }
  return null;
}

var LIST_FIELDS = /^(parents|spouse|children|father|mother)$/;
var SECTION_WORDS = /^(siblings?|half[ -]siblings?|brothers?|sisters?|brothers and sisters|grand ?parents|paternal|maternal|notes?|sources?|citations?|events?|timeline|biography|photos?|media|family|family members|relationships|research|comments|memorials?|flowers|see also|references|share|print|godson|goddaughter|neighbors|household|freres et soeurs|geschwister|broers en zussen|sosken|syskon)\b/i;

function isSectionLine(line){
  if(line.length > 40 || /\d/.test(line)) return false;
  var label = line.replace(/\s*[:：]$/, '');
  return SECTION_WORDS.test(label) || !!labels.fieldForLabel(label);
}

var EVENT_LINE = /^(born|birth|b\.|baptized|baptised|christened|bap\.|chr\.|died|deceased|death|d\.|buried|burial|bur\.|married|m\.|geboren|gestorben|gest\.|geb\.|ne|née|né|nee|decede|décédé|décédée|overleden|begraven|gedoopt|fodt|født|død|dod)\s+(.+)$/i;
var ABBREV = { 'b': 'born', 'd': 'died', 'bap': 'baptism', 'chr': 'baptism', 'bur': 'buried', 'm': 'married', 'geb': 'geboren', 'gest': 'gestorben' };

function bestPairs(pairs){
  var best = {};
  pairs.forEach(function(p){
    var cur = best[p.field];
    if(!cur || p.priority < cur.priority || (p.priority === cur.priority && p.order < cur.order)){
      best[p.field] = p;
    }
  });
  return best;
}

/* ---------- Building the shared record ---------- */

var NAME_JUNK = /\s*(\(|\[|\b(b|d|born|died|geb|gest|ne|nee)\.?\s+\d|\s[-–—]\s|\s\d{3,4}\b|,\s*(born|died|b\.|d\.)).*$/i;

var PARTICLES = /^(van|von|de|der|den|du|la|le|da|di|del|della|dos|das|of|y|zu|ten|ter|vom|zum|and|et|und|en|af|av|bin|ibn|al|el|st|ste|mc|mac)$/i;

/**
 * Does a string look like a person's name? Every word capitalized (or a
 * particle like "van"), no dates, at most one comma ("Surname, Given").
 */
function looksLikeName(s, minWords){
  if(!s || labels.fieldForLabel(s)) return false;
  if((s.match(/,/g) || []).length > 1) return false;
  var words = s.replace(/[,()"“”]/g, ' ').split(/\s+/).filter(Boolean);
  if(words.length < (minWords || 1) || words.length > 8) return false;
  return words.every(function(w){
    return /^[A-ZÀ-ÞĀ-Ž]/.test(w) || PARTICLES.test(w.replace(/\.$/, '')) || /^[IVX]+$/.test(w);
  }) && !words.some(function(w){ return labels.fieldForLabel(w); });
}

var NOT_A_NAME = /\b(record|records|register|search|results?|archives?|genealogy|family tree|database|view|index|transcriptions?|login|home|page|relationship|forenames?|marital|status|occupation|unknown|null)\b/i;

function cleanName(s){
  s = oneLine(s)
    .replace(/^[A-Z][\w ]{1,20}:\s*(?=\S)/, '')                  // "Person: ", "Person:Name" namespaces
    .replace(/^.*?\b(?:record|entry|profile|memorial) (?:for|of)\s+/i, '') // "Birth record for John"
    .replace(/^(?:married|mariee?|marie|x)\b.*?\b(?:to|with|avec|met|mit)\s+/i, '') // "Married in 1759 to Martha"
    .replace(/^\d+\s+/, '')
    .replace(NAME_JUNK, '')
    .replace(/,\s*(?=[a-z]).*$/, '')                                // "Name, occupation ..."
    .replace(/\s+(?:ca|abt|about|circa|c|bef|aft)\.?$/i, '')
    .replace(/([a-z.])[*+]?\d{1,2}\b/gi, '$1')   // footnote markers glued to names
    .replace(/[*+†✝]+/g, '')
    .replace(/^[\s•·*\-–—♂♀⚭]+|[\s,;:•·*\-–—]+$/g, '');
  return /[a-z]/i.test(s) && s.length <= 80 && !NOT_A_NAME.test(s) ? s : '';
}

function splitList(value){
  return value.split(/\n|;|\s+(?:and|&|og|en|et|und|och|y)\s+/i).map(cleanName).filter(function(n){
    return looksLikeName(n, 2);
  });
}

function headingName(document, url, root){
  var candidates = [];
  // Inside a person's own section (multi-person pages) its first heading names them
  var scoped = root && root !== document.body && root.querySelector('h1,h2,h3');
  if(scoped) candidates.push(oneLine(getText(scoped)));
  var firstHeading = function(tag){
    return Array.prototype.filter.call(document.querySelectorAll(tag), function(h){ return !skipped(h); })[0];
  };
  var h1 = firstHeading('h1');
  if(h1) candidates.push(oneLine(getText(h1)));
  var og = document.querySelector('meta[property="og:title"]');
  if(og) candidates.push(og.getAttribute('content') || '');
  candidates.push((document.title || '').split(/\s+[|\-–—:]\s+/)[0]);
  var h2 = firstHeading('h2');
  if(h2) candidates.push(oneLine(getText(h2)));
  var site = (url || '').replace(/^https?:\/\/(www\.)?/, '').split(/[./]/)[0].toLowerCase();
  for(var i = 0; i < candidates.length; i++){
    var n = cleanName(candidates[i]);
    if(n && n.split(' ').length <= 8 && (!site || n.toLowerCase().replace(/\W/g, '').indexOf(site) === -1)) return n;
  }
  return '';
}

function event(rec, type){
  return rec.events[type] = rec.events[type] || { date: '', place: '' };
}

function setDatePlace(rec, type, combined, date, place){
  if(!combined && !date && !place) return;
  var e = event(rec, type);
  // A combined value with no date is only trusted when it reads like a place
  if(combined && !dates.findDate(combined) &&
     (labels.genderForText(combined) || labels.fieldForLabel(combined) || /\b(relation|head|status|single|married|widow|unknown|yes|no)\b/i.test(combined))){
    combined = '';
  }
  if(combined){
    var split = dates.splitDatePlace(combined);
    e.date = e.date || split.date;
    e.place = e.place || split.place;
  }
  if(date) e.date = dates.findDate(date) ? oneLine(date) : e.date;
  if(place) e.place = oneLine(place);
}

/**
 * @return {{record: Object, strategy: String, fields: Number}|null}
 */
var PLACE_RANK = [
  /church|parish|kirke|sogn|prestegjeld/,
  /place|location|town|city|village|municipality|gemeente|commune|gemeinde|kommune|lieu|plaats|ort|sted|lugar/,
  /district|area/,
  /county|state|province/,
  /country/
];

function placeRank(label){
  var n = labels.normalizeLabel(label);
  for(var i = 0; i < PLACE_RANK.length; i++) if(PLACE_RANK[i].test(n)) return i;
  return 1;
}

function joinValues(pairs, field, priority, sep){
  var seen = {};
  return pairs.filter(function(p){ return p.field === field && p.priority === priority; })
    .sort(function(a, b){ return sep === ', ' ? (placeRank(a.label) - placeRank(b.label) || a.order - b.order) : a.order - b.order; })
    .map(function(p){ return sep === ', ' ? oneLine(p.value) : p.value; })
    .filter(function(v){ var k = v.toLowerCase(); if(seen[k]) return false; seen[k] = true; return true; })
    .join(sep);
}

function extract(document, url, root){
  var pairs = collectPairs(document, root);
  var best = bestPairs(pairs);
  // Several place-type labels ("Church", "Place", "County") combine, most specific first
  ['place', 'birthPlace', 'deathPlace', 'baptismPlace', 'marriagePlace'].forEach(function(f){
    if(best[f]) best[f].value = joinValues(pairs, f, best[f].priority, ', ');
  });
  // List fields gather every section ("Children of X and Y", "Children of X and Z")
  ['children', 'spouse'].forEach(function(f){
    if(best[f]) best[f].value = joinValues(pairs, f, best[f].priority, '\n');
  });
  var v = function(f){ return best[f] ? best[f].value : ''; };
  var fields = Object.keys(best);
  debug('fields', fields.join(','));

  var rec = { name: {}, gender: null, events: {}, relatives: [] };

  // Name
  rec.name.given = oneLine(v('given'));
  rec.name.surname = oneLine(v('surname'));
  // Marriage records name two parties; the groom (listed first) is the principal
  var groom = oneLine(v('groom')) || oneLine([v('groomGiven'), v('groomSurname')].join(' '));
  var bride = oneLine(v('bride')) || oneLine([v('brideGiven'), v('brideSurname')].join(' '));
  if(groom && !rec.name.given && !rec.name.surname && !v('name')){
    if(v('groomGiven') || v('groomSurname')){
      rec.name.given = oneLine(v('groomGiven'));
      rec.name.surname = oneLine(v('groomSurname'));
    } else {
      rec.name.full = cleanName(groom);
    }
    rec.gender = 'Male';
  }
  rec.name.full = cleanName(v('name')) ||
    (rec.name.given || rec.name.surname ? '' : headingName(document, url, root));

  rec.gender = labels.genderForText(oneLine(v('gender'))) || rec.gender;
  if(v('maritalStatus')) rec.events.MaritalStatus = { value: oneLine(v('maritalStatus')) };

  // Events
  setDatePlace(rec, 'Birth', v('birth'), v('birthDate'), v('birthPlace'));
  setDatePlace(rec, 'Baptism', v('baptism'), v('baptismDate'), v('baptismPlace'));
  setDatePlace(rec, 'Death', v('death'), v('deathDate'), v('deathPlace'));
  setDatePlace(rec, 'Burial', v('burial'), v('burialDate'), v('cemetery'));
  setDatePlace(rec, 'Marriage', v('marriage'), v('marriageDate'), v('marriagePlace'));
  if(v('residence')) event(rec, 'Residence').place = oneLine(v('residence'));
  if(v('occupation')) rec.events.Occupation = { value: oneLine(v('occupation')) };
  if(v('deathCause') && rec.events.Death) rec.events.Death.value = oneLine(v('deathCause'));

  var service = ['rank', 'unit', 'serviceNumber', 'conflict'].map(v).map(oneLine).filter(Boolean);
  if(service.length) rec.events.MilitaryService = { value: service.join(', ') };

  // Generic "Record type / Date / Place" record pages
  var generic = labels.eventTypeForText(v('eventType'));
  if(!generic && (v('date') || v('place'))){
    // Use the single event already found, if there's exactly one
    var found = Object.keys(rec.events).filter(function(k){ return /Birth|Baptism|Death|Burial|Marriage/.test(k); });
    generic = found.length === 1 ? found[0] : null;
  }
  if(generic){
    var e = event(rec, generic);
    if(!e.date && v('date')) e.date = (dates.findDate(v('date')) || {}).text || '';
    if(!e.place && v('place')) e.place = oneLine(v('place'));
  }

  // Relatives
  var father = cleanName(v('father')) || oneLine([v('fatherGiven'), v('fatherSurname') || (v('fatherGiven') ? rec.name.surname : '')].join(' '));
  var mother = cleanName(v('mother')) || oneLine([v('motherGiven'), v('motherSurname') || v('motherMaiden')].join(' '));
  // A child recorded by forename only takes the father's surname
  if(rec.name.given && !rec.name.surname && !rec.name.full && v('fatherSurname')) rec.name.surname = oneLine(v('fatherSurname'));
  if(father) rec.relatives.push({ role: 'parent', name: father, gender: 'Male' });
  if(mother) rec.relatives.push({ role: 'parent', name: mother, gender: 'Female' });
  if(!father && !mother && v('parents')){
    splitList(v('parents')).slice(0, 2).forEach(function(n){ rec.relatives.push({ role: 'parent', name: n }); });
  }
  if(groom && bride) rec.relatives.push({ role: 'spouse', name: cleanName(bride) || bride, gender: 'Female' });
  splitList(v('spouse')).forEach(function(n){ rec.relatives.push({ role: 'spouse', name: n }); });
  splitList(v('children')).forEach(function(n){ rec.relatives.push({ role: 'child', name: n }); });

  // Census records
  if(v('censusYear') || generic === 'Census'){
    var c = event(rec, 'Census');
    c.date = c.date || ((dates.findDate(v('censusYear')) || {}).text || '');
    c.place = c.place || oneLine(v('place'));
  }

  // Estimate birth year from age at a dated event
  var age = parseInt(oneLine(v('age')), 10);
  var dated = ['Census', 'Death', 'Burial'].map(function(k){ return rec.events[k]; }).filter(function(e){ return e && e.date; })[0];
  if(age >= 0 && age < 120 && dated && !(rec.events.Birth && rec.events.Birth.date)){
    var year = (dates.parseDateParts(dated.date).years || [])[0];
    if(year) event(rec, 'Birth').date = 'about ' + (year - age);
  }

  // Household members, related through their relationship to the head
  var myRel = labels.normalizeLabel(v('relationToHead'));
  pairs.household.forEach(function(m){
    var name = oneLine([m.given, m.surname].join(' ')) || cleanName(m.name || '');
    var rel = labels.normalizeLabel(m.relationToHead || '');
    if(!name || !rel) return;
    var role = householdRole(myRel, rel);
    if(role) rec.relatives.push({ role: role, name: name, gender: labels.genderForText(m.gender || '') });
  });

  // Drop events with nothing in them
  Object.keys(rec.events).forEach(function(k){
    var e = rec.events[k];
    if(!e.date && !e.place && !e.value) delete rec.events[k];
  });

  var hasName = rec.name.full || rec.name.given || rec.name.surname;
  var substance = Object.keys(rec.events).length + rec.relatives.length + (rec.gender ? 1 : 0);
  if(!hasName || substance === 0) return null;

  return { record: rec, strategy: 'labels', fields: fields.length };
}

module.exports = { extract: extract, collectPairs: collectPairs, getText: getText };
