/**
 * Strategy 1: read schema.org Person data the page already publishes,
 * either as JSON-LD or as HTML microdata. No site knowledge required.
 */

var debug = require('debug')('genscrape:generic:structured');

function isPersonType(type){
  if(!type) return false;
  var types = Array.isArray(type) ? type : [type];
  return types.some(function(t){ return /(^|\/)Person$/i.test(String(t)); });
}

function first(v){
  return Array.isArray(v) ? v[0] : v;
}

function asArray(v){
  if(v === undefined || v === null || v === '') return [];
  return Array.isArray(v) ? v : [v];
}

function text(v){
  v = first(v);
  if(v === undefined || v === null) return '';
  if(typeof v === 'object') return text(v.name || v['@value'] || v.value || '');
  return String(v).replace(/\s+/g, ' ').trim();
}

function placeText(v){
  v = first(v);
  if(!v) return '';
  if(typeof v !== 'object') return text(v);
  if(v.name) return text(v.name);
  var addr = first(v.address);
  if(addr && typeof addr === 'object'){
    return ['streetAddress', 'addressLocality', 'addressRegion', 'addressCountry']
      .map(function(k){ return text(addr[k]); })
      .filter(Boolean).join(', ');
  }
  return text(addr);
}

/* ---------- JSON-LD ---------- */

function collectJsonLd(document){
  var nodes = [];
  var scripts = document.querySelectorAll('script[type="application/ld+json"]');
  Array.prototype.forEach.call(scripts, function(s){
    try {
      walk(JSON.parse(s.textContent));
    } catch(e) {
      debug('bad json-ld', e.message);
    }
  });
  function walk(node){
    if(Array.isArray(node)){ node.forEach(walk); return; }
    if(!node || typeof node !== 'object') return;
    nodes.push(node);
    Object.keys(node).forEach(function(k){
      if(k !== '@context') walk(node[k]);
    });
  }
  return nodes;
}

/* ---------- Microdata ---------- */

function microdataValue(el){
  var tag = el.tagName.toLowerCase();
  if(el.hasAttribute('content')) return el.getAttribute('content');
  if(tag === 'meta') return el.getAttribute('content') || '';
  if(/^(a|link|area)$/.test(tag)) return el.getAttribute('href') || '';
  if(/^(img|audio|video|source|iframe|embed)$/.test(tag)) return el.getAttribute('src') || '';
  if(tag === 'time' && el.hasAttribute('datetime')) return el.getAttribute('datetime');
  return (el.textContent || '').replace(/\s+/g, ' ').trim();
}

function microdataItem(scope){
  var item = { '@type': scope.getAttribute('itemtype') || '' };
  (function walk(parent){
    Array.prototype.forEach.call(parent.children, function(child){
      var props = child.getAttribute('itemprop');
      var isScope = child.hasAttribute('itemscope');
      if(props){
        var value = isScope ? microdataItem(child) : microdataValue(child);
        props.trim().split(/\s+/).forEach(function(p){
          item[p] = item[p] === undefined ? value : asArray(item[p]).concat([value]);
        });
      }
      if(!isScope) walk(child);
    });
  })(scope);
  return item;
}

function collectMicrodata(document){
  var nodes = [];
  Array.prototype.forEach.call(document.querySelectorAll('[itemscope]'), function(el){
    if(isPersonType(el.getAttribute('itemtype'))){
      var item = microdataItem(el);
      item._topLevel = !el.hasAttribute('itemprop');
      nodes.push(item);
    }
  });
  return nodes;
}

/* ---------- Mapping to the shared record shape ---------- */

function personToRecord(p, byId){
  function resolve(v){
    if(v && typeof v === 'object' && v['@id'] && byId[v['@id']]) return byId[v['@id']];
    return v;
  }

  var rec = {
    name: {
      full: text(p.name),
      given: text(p.givenName),
      surname: text(p.familyName)
    },
    gender: null,
    events: {},
    relatives: []
  };

  var g = text(p.gender).toLowerCase();
  if(/female|woman|^f$/.test(g)) rec.gender = 'Female';
  else if(/male|man|^m$/.test(g)) rec.gender = 'Male';

  [['Birth', 'birth'], ['Death', 'death']].forEach(function(e){
    var date = text(p[e[1] + 'Date']), place = placeText(p[e[1] + 'Place']);
    if(date || place) rec.events[e[0]] = { date: date, place: place };
  });
  var home = placeText(p.homeLocation);
  if(home) rec.events.Residence = { date: '', place: home };
  var job = text(p.jobTitle);
  if(job) rec.events.Occupation = { value: job };

  [['parent', 'parent'], ['parent', 'parents'], ['spouse', 'spouse'], ['child', 'children']].forEach(function(r){
    asArray(p[r[1]]).forEach(function(rel){
      rel = resolve(rel);
      var name = typeof rel === 'object' ? (text(rel.name) || [text(rel.givenName), text(rel.familyName)].join(' ').trim()) : text(rel);
      if(name && !/^https?:/.test(name)){
        rec.relatives.push({ role: r[0], name: name, gender: rel && typeof rel === 'object' ? personToRecord(rel, byId).gender : null });
      }
    });
  });

  return rec;
}

function score(p){
  return Object.keys(p).length + (p._topLevel ? 100 : 0) + (p.mainEntityOfPage ? 50 : 0);
}

/**
 * @return {{record: Object, strategy: String}|null}
 */
function extract(document, url, root){
  var jsonld = collectJsonLd(document);
  var byId = {};
  jsonld.forEach(function(n){ if(n['@id']) byId[n['@id']] = n; });

  // Prefer the Person that a page declares as its main entity
  var mainIds = jsonld.map(function(n){ return n.mainEntity && n.mainEntity['@id']; }).filter(Boolean);
  var people = jsonld.filter(function(n){ return isPersonType(n['@type']) && (n.name || n.givenName || n.familyName); });
  var strategy = 'jsonld';

  if(!people.length){
    people = collectMicrodata(document);
    strategy = 'microdata';
  }
  if(!people.length) return null;

  var principal = people.filter(function(p){ return mainIds.indexOf(p['@id']) !== -1; })[0] ||
    people.slice().sort(function(a, b){ return score(b) - score(a); })[0];

  var record = personToRecord(principal, byId);
  if(!record.name.full && !record.name.given && !record.name.surname) return null;
  return { record: record, strategy: strategy };
}

module.exports = { extract: extract };
