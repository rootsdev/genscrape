/**
 * Strategy 3: read biographical prose and abbreviated summaries, e.g.
 *   "John Smith was born on 12 May 1850 at Boston. He was the son of A and B."
 *   "Son of Joseph and Ada Rodrigues; husband of Mary."
 *   "M, #91, b. 21 May 1772, d. 12 October 1863"
 * English patterns plus the most common French/German/Dutch equivalents.
 * Only fills fields the other strategies left empty.
 */

var dates = require('./dates');

var NAME = "([A-Z][\\w'’.\\-]*(?:\\s+(?:(?:van|von|de|der|den|du|la|le|da|di|of|y|zu|ten|ter)\\s+)*[A-Z][\\w'’.\\-]*){0,6})";
var DATE_PLACE = '((?:on |in |le |am |op )?[^.;\\n]{0,40}?\\d{3,4}[^.;\\n]{0,80})';

var EVENTS = [
  ['Birth',   /\b(?:was born|born|b\.|né|née|geboren|ble født|föddes)\s+/i],
  ['Baptism', /\b(?:was (?:baptized|baptised|christened)|baptized|baptised|christened|bap\.|chr\.|gedoopt|getauft)\s+/i],
  ['Death',   /\b(?:died|d\.|décédée?|gestorben|overleden|døde|dog)\s+/i],
  ['Burial',  /\b(?:was buried|buried|bur\.|inhumée?|begraben|begraven)\s+/i]
];

function firstSentenceMatch(text, re){
  var m = re.exec(text);
  if(!m) return null;
  var rest = text.substr(m.index + m[0].length, 160).split(/(?:\.\s+(?=[A-Z])|;|\n|\.$)/)[0];
  // Abbreviated summaries ("b. 21 May 1772, d. 1863") end at the next comma + marker
  rest = rest.split(/,\s*(?:b|d|bap|chr|bur|m)\.\s/)[0];
  return rest;
}

function extract(document, text){
  var rec = { name: {}, gender: null, events: {}, relatives: [] };
  text = text.replace(/\[\d+\]/g, '').replace(/([a-zA-Z.])\d{1,2}(?=\s|$)/gm, '$1'); // drop footnote markers

  EVENTS.forEach(function(e){
    var rest = firstSentenceMatch(text, e[1]);
    if(!rest) return;
    var split = dates.splitDatePlace(rest);
    if(split.date){
      rec.events[e[0]] = { date: split.date, place: split.place.split(/\s+(?:to|and|with|by|son|daughter)\s+/)[0] };
    }
  });

  var m;
  var parents = new RegExp('\\b([Ss]on|[Dd]aughter|[Cc]hild|[Ff]ils|[Ff]ille|[Ss]ohn|[Tt]ochter|[Zz]oon|[Dd]ochter)\\s+(?:of|de|du|von|van)\\s+' + NAME + '(?:\\s+(?:and|et|und|en|&)\\s+' + NAME + ')?').exec(text);
  if(parents){
    rec.gender = /son|fils|sohn|zoon/i.test(parents[1]) ? 'Male' : 'Female';
    var father = parents[2], mother = parents[3];
    // "Son of Joseph and Ada Rodrigues": share the trailing surname
    if(mother && father.split(/\s+/).length === 1 && mother.split(/\s+/).length > 1){
      father += ' ' + mother.split(/\s+/).pop();
    }
    rec.relatives.push({ role: 'parent', name: father, gender: 'Male' });
    if(mother) rec.relatives.push({ role: 'parent', name: mother, gender: 'Female' });
  }

  if((m = new RegExp('\\b([Hh]usband|[Ww]ife|[Ww]idow|[Ww]idower|épou(?:x|se)|ehemann|ehefrau|echtgeno(?:ot|te))\\s+of\\s+' + NAME).exec(text))){
    rec.relatives.push({ role: 'spouse', name: m[2] });
    rec.gender = rec.gender || (/husband|widower|époux|ehemann|echtgenoot/i.test(m[1]) ? 'Male' : 'Female');
  } else {
    var marriedRe = new RegExp('\\b(?:He|She)\\s+married\\s+' + NAME + '([^.;\\n]{0,120})', 'g');
    while((m = marriedRe.exec(text))){
      rec.relatives.push({ role: 'spouse', name: m[1] });
      var md = dates.splitDatePlace((m[2] || '').replace(/^,[^,]*,/, ''));
      if(md.date && !rec.events.Marriage) rec.events.Marriage = { date: md.date, place: md.place.replace(/^.*?\b(?:at|in)\s+/, '') };
    }
  }

  // "Father of A; B and C"
  if((m = /\b(?:[Ff]ather|[Mm]other|[Pp]arent|[Pp]ère|[Mm]ère|[Vv]ater|[Mm]utter|[Vv]ader|[Mm]oeder)\s+(?:of|de|von|van)\s+([^\n]+)/.exec(text))){
    m[1].split(/;|\s+and\s+|\s+et\s+|\s+und\s+|\s+en\s+/).forEach(function(n){
      n = n.replace(/,.*$/, '').trim();
      var nm = new RegExp('^' + NAME + '$').exec(n);
      if(nm) rec.relatives.push({ role: 'child', name: nm[1] });
    });
    rec.gender = rec.gender || (/^[FPVfpv]/.test(m[0]) && !/^[Pp]arent/.test(m[0]) ? 'Male' : 'Female');
  }

  if(!rec.gender){
    var he = (text.match(/\b(He|His|Him)\b/g) || []).length, she = (text.match(/\b(She|Her|Hers)\b/g) || []).length;
    if(he >= 2 && he > she * 2) rec.gender = 'Male';
    else if(she >= 2 && she > he * 2) rec.gender = 'Female';
  }

  var substance = Object.keys(rec.events).length + rec.relatives.length;
  return substance ? { record: rec, strategy: 'narrative' } : null;
}

module.exports = { extract: extract };
