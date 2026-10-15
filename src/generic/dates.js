/**
 * Locale-tolerant helpers for finding a date inside a free-text value and
 * splitting "12 Jan 1850, London" style values into a date and a place.
 */

var MONTHS = [
  // en, fr, de, nl, no/da, sv, es (full and common abbreviations)
  ['january', 'jan', 'janvier', 'janv', 'januar', 'januari', 'enero', 'ene', 'jänner'],
  ['february', 'feb', 'febr', 'fevrier', 'fev', 'februar', 'februari', 'febrero'],
  ['march', 'mar', 'mars', 'marz', 'maart', 'mrt', 'marzo'],
  ['april', 'apr', 'avril', 'avr', 'abril', 'abr'],
  ['may', 'mai', 'mei', 'maj', 'mayo'],
  ['june', 'jun', 'juin', 'juni', 'junio'],
  ['july', 'jul', 'juillet', 'juil', 'juli', 'julio'],
  ['august', 'aug', 'aout', 'augustus', 'agosto', 'ago'],
  ['september', 'sep', 'sept', 'septembre', 'septiembre'],
  ['october', 'oct', 'octobre', 'oktober', 'okt', 'octubre'],
  ['november', 'nov', 'novembre', 'noviembre'],
  ['december', 'dec', 'decembre', 'dezember', 'dez', 'desember', 'diciembre', 'dic']
];

var monthIndex = {};
MONTHS.forEach(function(names, i){
  names.forEach(function(n){ monthIndex[n] = i + 1; });
});

var MONTH_RE = '(?:' + Object.keys(monthIndex).sort(function(a, b){ return b.length - a.length; }).join('|') + ')\\.?';
var QUAL_RE = '(?:(?:abt|about|circa|ca|c|bef|before|aft|after|est|estimated|vers|rond|omstreeks|um|ca|between|bet|le|on|den|der|am)\\.?\\s+)?';
var DAY_RE = '(?:[0-3]?\\d)(?:st|nd|rd|th|er|e|\\.)?';
var YEAR_RE = '(?:1[0-9]{3}|20[0-9]{2})';

var DATE_PATTERNS = [
  // 12 January 1850 / 12. Januar 1850 / 12 jan. 1850
  DAY_RE + '\\s+' + MONTH_RE + ',?\\s+' + YEAR_RE,
  // January 12, 1850
  MONTH_RE + '\\s+' + DAY_RE + ',?\\s+' + YEAR_RE,
  // 1850-01-12
  YEAR_RE + '-[01]?\\d-[0-3]?\\d',
  // 12/01/1850, 12.01.1850, 12-01-1850
  '[0-3]?\\d[\\/.\\-][01]?\\d[\\/.\\-]' + YEAR_RE,
  // Quarter style (FreeBMD etc.): Mar 1850 / Q1 1850
  '(?:q[1-4]|' + MONTH_RE + ')\\s+(?:quarter\\s+)?' + YEAR_RE,
  // 1850
  YEAR_RE
];

var DATE_RE = new RegExp('(?:^|[^\\w])(' + QUAL_RE + '(?:' + DATE_PATTERNS.join('|') + '))(?![\\w])', 'i');

function stripAccents(s){
  return s.normalize ? s.normalize('NFD').replace(/[̀-ͯ]/g, '') : s;
}

/**
 * Find the first date in a string.
 * @return {{text: String, index: Number}|null}
 */
function findDate(text){
  if(!text) return null;
  var m = DATE_RE.exec(stripAccents(text));
  if(!m) return null;
  var start = m.index + m[0].indexOf(m[1]);
  return { text: text.substr(start, m[1].length).trim(), index: start };
}

var PLACE_LEAD = /^[\s,;:\-–—]*(?:(?:in|at|a|à|te|i|en|zu|im|au|aux|bei|near)\s+)?/i;

function cleanPlace(s){
  if(!s) return '';
  s = s.replace(PLACE_LEAD, '').replace(/[\s,;:\-–—]+$/, '').trim();
  return /[a-z]/i.test(s) ? s : '';
}

/**
 * Split "12 Jan 1850 in London, England" into date + place.
 */
function splitDatePlace(text){
  text = (text || '').replace(/\s+/g, ' ').trim();
  var d = findDate(text);
  if(!d){
    return { date: '', place: cleanPlace(text) };
  }
  var before = text.substr(0, d.index), after = text.substr(d.index + d.text.length);
  return {
    date: d.text,
    place: cleanPlace(after) || cleanPlace(before)
  };
}

/**
 * Canonical {years, month, day} used for comparisons.
 */
function parseDateParts(text){
  text = stripAccents((text || '').toLowerCase());
  var years = (text.match(/\b(1[0-9]{3}|20[0-9]{2})\b/g) || []);
  var month = null, day = null, m;
  var words = text.match(/[a-z]+/g) || [];
  for(var i = 0; i < words.length; i++){
    if(monthIndex[words[i]] && words[i] !== 'c' ){ month = monthIndex[words[i]]; break; }
  }
  if((m = /\b(1[0-9]{3}|20[0-9]{2})-([01]?\d)-([0-3]?\d)\b/.exec(text))){
    month = +m[2]; day = +m[3];
  } else if((m = /\b([0-3]?\d)[\/.\-]([01]?\d)[\/.\-](1[0-9]{3}|20[0-9]{2})\b/.exec(text))){
    day = +m[1]; month = +m[2];
  } else if((m = /\b([0-3]?\d)(?:st|nd|rd|th|er|e|\.)?\s+[a-z]/.exec(text)) && month){
    day = +m[1];
  } else if((m = /[a-z]\.?\s+([0-3]?\d)(?:st|nd|rd|th)?,?\s+\d{4}/.exec(text)) && month){
    day = +m[1];
  }
  return { years: years, month: month, day: day };
}

module.exports = {
  findDate: findDate,
  splitDatePlace: splitDatePlace,
  parseDateParts: parseDateParts,
  stripAccents: stripAccents
};
