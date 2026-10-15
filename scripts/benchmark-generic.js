#!/usr/bin/env node
/**
 * Benchmark the generic extractor against every HTML test fixture.
 *
 * "Before" = the recorded output of the hand-written scraper for that page.
 * "After"  = what src/generic produces for the same page with no site code.
 *
 * Both are reduced to comparable atoms (principal name, gender, each fact's
 * type/date/place, each relative's role+name) and matched.
 *
 * Usage: node scripts/benchmark-generic.js [--out benchmark] [--only scraper]
 */

var fs = require('fs'),
    path = require('path'),
    jsdom = require('jsdom'),
    generic = require('../src/generic'),
    dates = require('../src/generic/dates');

var ROOT = path.join(__dirname, '..');
var args = process.argv.slice(2);
var outDir = path.join(ROOT, args[args.indexOf('--out') + 1] && args.indexOf('--out') !== -1 ? args[args.indexOf('--out') + 1] : 'benchmark');
var only = args.indexOf('--only') !== -1 ? args[args.indexOf('--only') + 1] : null;

/* ---------- Find fixtures ---------- */

function findCases(){
  var cases = [];
  var testDir = path.join(ROOT, 'test/src/scrapers');
  fs.readdirSync(testDir).sort().forEach(function(file){
    var src = fs.readFileSync(path.join(testDir, file), 'utf8');
    var runner = /createTestRunner\(\s*['"]([^'"]+)['"]\s*\)/.exec(src);
    if(!runner) return; // AJAX/nock based scrapers have JSON fixtures, not pages
    var scraper = runner[1];
    if(only && scraper !== only) return;
    var re = /setupTest\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]/g, m;
    while((m = re.exec(src))){
      var page = path.join(ROOT, 'test/data', scraper, 'pages', m[1] + '.html');
      var output = path.join(ROOT, 'test/data', scraper, 'output', m[1] + '.json');
      if(fs.existsSync(page) && fs.existsSync(output)){
        cases.push({ scraper: scraper, name: m[1], url: m[2], page: page, output: output });
      }
    }
  });
  return cases;
}

/* ---------- Atoms ---------- */

// Synonymous GEDCOM X fact types count as the same type
var TYPE_ALIAS = { Christening: 'Baptism' };
function suffix(uri){ var s = (uri || '').split('/').pop(); return TYPE_ALIAS[s] || s; }

function personName(p){
  if(!p || !p.names || !p.names.length) return '';
  var form = (p.names[0].nameForms || [])[0] || {};
  return form.fullText || (form.parts || []).map(function(x){ return x.value; }).join(' ');
}

function atoms(doc){
  var persons = doc.persons || [];
  var byId = {};
  persons.forEach(function(p){ byId[p.id] = p; });
  var principal = persons.filter(function(p){ return p.principal; })[0] || persons[0];
  var result = { name: '', gender: '', facts: [], relatives: [] };
  if(!principal) return result;
  var pid = '#' + principal.id;

  result.name = personName(principal);
  result.gender = principal.gender ? suffix(principal.gender.type) : '';

  function addFact(f){
    result.facts.push({
      type: suffix(f.type),
      date: f.date ? (f.date.original || f.date.formal || '') : '',
      place: f.place ? (f.place.original || '') : ''
    });
  }
  (principal.facts || []).forEach(addFact);

  (doc.relationships || []).forEach(function(r){
    var p1 = r.person1 && r.person1.resource, p2 = r.person2 && r.person2.resource;
    if(p1 !== pid && p2 !== pid) return;
    var other = byId[(p1 === pid ? p2 : p1 || '').replace('#', '')];
    var role;
    if(suffix(r.type) === 'Couple'){
      role = 'spouse';
      (r.facts || []).forEach(addFact);
    } else {
      role = p2 === pid ? 'parent' : 'child';
    }
    var n = personName(other);
    if(n) result.relatives.push({ role: role, name: n });
  });
  return result;
}

/* ---------- Matching ---------- */

function tokens(s){
  return dates.stripAccents((s || '').toLowerCase()).replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(Boolean);
}

function nameMatch(a, b){
  var ta = tokens(a), tb = tokens(b);
  if(!ta.length || !tb.length) return false;
  var inter = ta.filter(function(t){ return tb.indexOf(t) !== -1; }).length;
  var union = ta.length + tb.length - inter;
  var shorter = Math.min(ta.length, tb.length);
  return inter / union >= 0.6 || (inter === shorter && shorter >= 2);
}

function dateMatch(a, b){
  var pa = dates.parseDateParts(a), pb = dates.parseDateParts(b);
  if(!pa.years.length || pa.years.join() !== pb.years.join()) return false;
  if(pa.month && pb.month && pa.month !== pb.month) return false;
  if(pa.day && pb.day && pa.day !== pb.day) return false;
  // Before had a full date and after lost the month/day: not a match
  if((pa.month && !pb.month) || (pa.day && !pb.day)) return false;
  return true;
}

function placeMatch(a, b){
  var ta = tokens(a), tb = tokens(b);
  if(!ta.length || !tb.length) return false;
  var inter = ta.filter(function(t){ return tb.indexOf(t) !== -1; }).length;
  return inter / ta.length >= 0.5;
}

/**
 * Compare before/after atoms.
 * Returns rows for display plus totals.
 */
function compare(before, after){
  var rows = [];
  function row(field, b, a, ok){ rows.push({ field: field, before: b, after: a, ok: ok }); }

  // Name
  if(before.name) row('name', before.name, after.name, nameMatch(before.name, after.name));
  else if(after.name) row('name', '', after.name, null);

  // Gender
  if(before.gender) row('gender', before.gender, after.gender, before.gender === after.gender);
  else if(after.gender) row('gender', '', after.gender, null);

  // Facts: pair by type, then best date/place agreement
  var used = [];
  before.facts.forEach(function(bf){
    var best = null, bestScore = -1;
    after.facts.forEach(function(af, i){
      if(used.indexOf(i) !== -1 || af.type !== bf.type) return;
      var s = (bf.date && dateMatch(bf.date, af.date) ? 1 : 0) + (bf.place && placeMatch(bf.place, af.place) ? 1 : 0);
      if(s > bestScore){ best = i; bestScore = s; }
    });
    var af = best === null ? null : after.facts[best];
    if(best !== null) used.push(best);
    row('fact ' + bf.type, bf.type, af ? af.type : '', !!af);
    if(bf.date) row('  date', bf.date, af ? af.date : '', !!(af && dateMatch(bf.date, af.date)));
    if(bf.place) row('  place', bf.place, af ? af.place : '', !!(af && placeMatch(bf.place, af.place)));
  });
  after.facts.forEach(function(af, i){
    if(used.indexOf(i) === -1){
      row('fact ' + af.type, '', [af.type, af.date, af.place].filter(Boolean).join(' · '), null);
    }
  });

  // Relatives
  var usedRel = [];
  before.relatives.forEach(function(br){
    var idx = -1;
    after.relatives.forEach(function(ar, i){
      if(idx === -1 && usedRel.indexOf(i) === -1 && ar.role === br.role && nameMatch(br.name, ar.name)) idx = i;
    });
    if(idx !== -1) usedRel.push(idx);
    row(br.role, br.name, idx !== -1 ? after.relatives[idx].name : '', idx !== -1);
  });
  after.relatives.forEach(function(ar, i){
    if(usedRel.indexOf(i) === -1) row(ar.role, '', ar.name, null);
  });

  var expected = rows.filter(function(r){ return r.ok !== null; });
  var matched = expected.filter(function(r){ return r.ok; }).length;
  var extra = rows.filter(function(r){ return r.ok === null; }).length;
  var produced = matched + extra + expected.filter(function(r){ return !r.ok && r.after; }).length;
  return {
    rows: rows,
    expected: expected.length,
    matched: matched,
    extra: extra,
    recall: expected.length ? matched / expected.length : 1,
    precision: produced ? matched / produced : 0
  };
}

/* ---------- Run ---------- */

function loadPage(c){
  return new Promise(function(resolve){
    jsdom.env({
      file: c.page,
      url: c.url,
      features: { FetchExternalResources: false, ProcessExternalResources: false },
      done: function(err, window){ resolve({ err: err, window: window }); }
    });
  });
}

function pct(x){ return Math.round(x * 100) + '%'; }

function verdict(recall){
  if(recall >= 0.9) return 'generic';
  if(recall >= 0.6) return 'config';
  return 'custom';
}

async function main(){
  var cases = findCases();
  var results = [];
  for(var i = 0; i < cases.length; i++){
    var c = cases[i];
    var before = atoms(JSON.parse(fs.readFileSync(c.output, 'utf8')));
    var loaded = await loadPage(c);
    var out = null, error = null;
    try {
      global.window = loaded.window;
      global.document = loaded.window.document;
      out = generic.extract(loaded.window.document, c.url);
    } catch(e) {
      error = e.stack.split('\n').slice(0, 3).join(' | ');
    }
    if(loaded.window) loaded.window.close();
    var after = out ? atoms(out.gedx.toJSON()) : atoms({});
    var cmp = compare(before, after);
    results.push({
      scraper: c.scraper, name: c.name, url: c.url,
      strategy: out ? out.strategy : (error ? 'error' : 'none'),
      error: error,
      expected: cmp.expected, matched: cmp.matched, extra: cmp.extra,
      recall: cmp.recall, precision: cmp.precision,
      rows: cmp.rows
    });
    process.stderr.write('.');
  }
  process.stderr.write('\n');

  // Per-scraper summary
  var byScraper = {};
  results.forEach(function(r){
    var s = byScraper[r.scraper] = byScraper[r.scraper] || { scraper: r.scraper, pages: 0, expected: 0, matched: 0, extra: 0, strategies: {} };
    s.pages++; s.expected += r.expected; s.matched += r.matched; s.extra += r.extra;
    s.strategies[r.strategy] = (s.strategies[r.strategy] || 0) + 1;
  });
  var summary = Object.keys(byScraper).map(function(k){
    var s = byScraper[k];
    s.recall = s.expected ? s.matched / s.expected : 1;
    s.verdict = verdict(s.recall);
    return s;
  }).sort(function(a, b){ return b.recall - a.recall; });

  var total = results.reduce(function(t, r){ t.e += r.expected; t.m += r.matched; return t; }, { e: 0, m: 0 });

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'results.json'), JSON.stringify({ total: total, summary: summary, pages: results }, null, 2));

  // Markdown report: summary + every page before/after
  var md = ['# Generic extractor benchmark', '',
    'Before = hand-written scraper output. After = `src/generic` with no site code.', '',
    '**Overall:** ' + total.m + ' / ' + total.e + ' expected fields matched (' + pct(total.m / total.e) + ') across ' + results.length + ' pages and ' + summary.length + ' scrapers.', '',
    '## By scraper', '',
    '| Scraper | Pages | Matched | Recall | Extra fields | Strategy | Verdict |',
    '|---|---|---|---|---|---|---|'];
  summary.forEach(function(s){
    md.push('| ' + [s.scraper, s.pages, s.matched + '/' + s.expected, pct(s.recall), s.extra,
      Object.keys(s.strategies).map(function(k){ return k + '×' + s.strategies[k]; }).join(', '), s.verdict].join(' | ') + ' |');
  });
  md.push('', 'Verdict: **generic** ≥ 90% recall, **config** 60–89%, **custom** < 60%.', '', '## Every page: before vs after', '');
  results.forEach(function(r){
    md.push('### ' + r.scraper + ' / ' + r.name + ' — ' + pct(r.recall) + ' (' + r.matched + '/' + r.expected + ', ' + r.strategy + ')', '');
    md.push('<' + r.url + '>', '');
    if(r.error) md.push('Error: `' + r.error + '`', '');
    md.push('| Field | Before | After | |', '|---|---|---|---|');
    r.rows.forEach(function(row){
      var mark = row.ok === true ? '✓' : row.ok === false ? '✗' : '+';
      md.push('| ' + [row.field, esc(row.before), esc(row.after), mark].join(' | ') + ' |');
    });
    md.push('');
  });
  fs.writeFileSync(path.join(outDir, 'report.md'), md.join('\n'));

  // Console summary
  console.log('Overall: ' + total.m + '/' + total.e + ' (' + pct(total.m / total.e) + ') over ' + results.length + ' pages');
  summary.forEach(function(s){
    console.log([pad(s.scraper, 32), pad(s.pages + 'p', 5), pad(s.matched + '/' + s.expected, 9), pad(pct(s.recall), 5), pad('+' + s.extra, 5), s.verdict].join(' '));
  });
}

function esc(s){ return String(s || '').replace(/\|/g, '\\|').replace(/\n/g, ' '); }
function pad(s, n){ s = String(s); return s.length >= n ? s : s + new Array(n - s.length + 1).join(' '); }

main().catch(function(e){ console.error(e); process.exit(1); });
