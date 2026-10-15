/**
 * Strategy: page state embedded as JSON (React/Next props, __INITIAL_STATE__,
 * <script type="application/json">). Walks every object and scores it by how
 * many of its keys map to genealogical fields via the label dictionary
 * ("birthDate" -> "birth date" -> birthDate). The best-scoring object is the
 * principal.
 */

var labels = require('./labels'),
    dates = require('./dates');

var STATE_RE = /(?:window\.)?(?:__[A-Z_]+__|__NEXT_DATA__|initialState|INITIAL_STATE)\s*=\s*(\{[\s\S]*?\});?\s*(?:<\/script>|$|\n)/;

function keyToLabel(key){
  return key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_\-]+/g, ' ');
}

function parseScripts(document){
  var roots = [];
  Array.prototype.forEach.call(document.querySelectorAll('script'), function(s){
    var type = (s.getAttribute('type') || '').toLowerCase();
    var txt = s.textContent || '';
    if(type === 'application/ld+json') return; // handled by structured.js
    try {
      if(type === 'application/json'){
        txt = txt.trim();
        // Some sites ship the state base64-encoded
        if(/^[A-Za-z0-9+\/=\s]{40,}$/.test(txt) && txt.charAt(0) !== '{'){
          var win = document.defaultView || {};
          txt = decodeURIComponent(escape((win.atob || atob)(txt.replace(/\s+/g, ''))));
        }
        roots.push(JSON.parse(txt));
        return;
      }
      var m = STATE_RE.exec(txt);
      if(m) roots.push(JSON.parse(m[1]));
    } catch(e) { /* not JSON */ }
  });
  return roots;
}

function scalar(v){
  if(v === null || v === undefined) return '';
  if(typeof v === 'object'){
    // {year, month, day} / {text} / {name} shaped values
    if(v.year) return [v.day, v.month, v.year].filter(Boolean).join(' ');
    return scalar(v.text || v.name || v.value || v.display || v.original || '');
  }
  return String(v).replace(/\s+/g, ' ').trim();
}

function mapObject(obj){
  var out = {};
  Object.keys(obj).forEach(function(k){
    var v = obj[k];
    // Skip empty values and translation tables ({"First Name": "First Name"})
    if(v === null || v === '' || (typeof v === 'string' && labels.normalizeLabel(v) === labels.normalizeLabel(k))) return;
    if(typeof v === 'string' && labels.isNullish(v)) return;
    var f = labels.fieldForLabel(keyToLabel(k));
    if(!f) return;
    // Several keys can map to one field ("death_year", "death_date"): keep the fullest
    if(out[f] === undefined || (typeof v !== 'object' && scalar(v).length > scalar(out[f]).length)){
      out[f] = v;
      out['_key_' + f] = k;
    }
  });
  return out;
}

function nameOf(obj){
  var m = mapObject(obj);
  var full = scalar(m.name);
  var parts = [scalar(m.given), scalar(m.surname)].join(' ').trim();
  return parts || full;
}

/**
 * "cemetery_name": "Oakes Cemetery" plus sibling keys "cemetery_city",
 * "cemetery_county", "cemetery_state", "cemetery_country" -> one full place.
 */
function withRegion(obj, key, place){
  if(!key || !place) return place;
  var prefix = key.replace(/([_\-]?(name|place|location))$/i, '');
  if(prefix === key) return place;
  var parts = [place];
  ['city', 'town', 'county', 'state', 'province', 'region', 'country'].forEach(function(s){
    Object.keys(obj).forEach(function(k){
      if(k.toLowerCase().replace(/[_\-]/g, '') === (prefix + s).toLowerCase().replace(/[_\-]/g, '')){
        var v = scalar(obj[k]);
        if(v && parts.indexOf(v) === -1) parts.push(v);
      }
    });
  });
  return parts.join(', ');
}

function extract(document, url, root){
  var best = null, bestScore = 2;
  var seen = 0;

  function walk(node, depth){
    if(!node || typeof node !== 'object' || depth > 25 || seen++ > 50000) return;
    if(Array.isArray(node)){ node.forEach(function(n){ walk(n, depth + 1); }); return; }
    var m = mapObject(node);
    var hasName = m.name !== undefined || m.given !== undefined || m.surname !== undefined;
    var score = Object.keys(m).length;
    if(hasName && score > bestScore && nameOf(node)){ best = node; bestScore = score; }
    Object.keys(node).forEach(function(k){ walk(node[k], depth + 1); });
  }
  parseScripts(document).forEach(function(r){ walk(r, 0); });
  if(!best) return null;

  var m = mapObject(best);
  var rec = {
    name: { given: scalar(m.given), surname: scalar(m.surname), full: scalar(m.name) },
    gender: labels.genderForText(scalar(m.gender)),
    events: {},
    relatives: []
  };
  if(rec.name.given || rec.name.surname) rec.name.full = '';

  [['Birth', 'birth', 'birthDate', 'birthPlace'],
   ['Baptism', 'baptism', 'baptismDate', 'baptismPlace'],
   ['Death', 'death', 'deathDate', 'deathPlace'],
   ['Burial', 'burial', 'burialDate', 'cemetery'],
   ['Marriage', 'marriage', 'marriageDate', 'marriagePlace']].forEach(function(e){
    var combined = scalar(m[e[1]]), date = scalar(m[e[2]]), place = withRegion(best, m['_key_' + e[3]], scalar(m[e[3]]));
    if(combined && !date && !place){
      var split = dates.splitDatePlace(combined);
      date = split.date; place = split.place;
    }
    if(date || place) rec.events[e[0]] = { date: date, place: place };
  });

  [['parent', 'parents'], ['parent', 'father'], ['parent', 'mother'], ['spouse', 'spouse'], ['child', 'children']].forEach(function(r){
    var v = m[r[1]];
    (Array.isArray(v) ? v : v ? [v] : []).forEach(function(rel){
      var n = typeof rel === 'object' ? nameOf(rel) : scalar(rel);
      if(n) rec.relatives.push({ role: r[0], name: n });
    });
  });

  return { record: rec, strategy: 'json' };
}

module.exports = { extract: extract };
