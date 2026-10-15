[![npm](https://img.shields.io/npm/v/genscrape.svg?maxAge=2592000)](https://www.npmjs.com/package/genscrape)
[![Build Status](https://travis-ci.org/rootsdev/genscrape.svg)](https://travis-ci.org/rootsdev/genscrape)
[![Coverage Status](https://coveralls.io/repos/rootsdev/genscrape/badge.svg)](https://coveralls.io/r/rootsdev/genscrape)

genscrape
==========

A JavaScript library that aids in scraping person data off of genealogy websites.
It is designed to be used in a browser extension. Data is output in
[GEDCOM X](http://www.gedcomx.org/) format.

## Install

```
npm install --save genscrape
```

Or use the [CDN](https://unpkg.com/#/)

```html
<script src="https://unpkg.com/genscrape@latest/dist/genscrape.min.js"></script>
```

We recommend pinning CDN links to a specific version.

## Usage

Scraping is sometimes asynchronous so we chose to implement the [EventEmitter](https://nodejs.org/api/events.html)
interface using [EventEmmitter2](https://github.com/asyncly/EventEmitter2).

```js
genscrape().on('data', function(data){
  // Do something with the data
});
```

That's it. Genscrape automatically detects what page you're on, looks up the
correct scraper, then does its magic.

### Events

#### data

The `data` event is fired when genscrape successfully scrapes data from the page.
Read more about the data model below.

When the data came from the generic extractor (see below), a second argument
`{generic: true, strategy: '...'}` is passed to the handler.

#### noMatch

The `noMatch` event is fired when genscrape is called on a page with a URL that
it does not recognize and the generic extractor could not find a person on it.
In other words, it does not have a parser registered for the URL.

### Generic extractor

When no scraper is registered for a URL, genscrape reads the page with a
site-agnostic extractor instead (`src/generic/`). It tries, in order:
schema.org JSON-LD and microdata, JSON page state embedded in scripts,
label/value pairs (tables, definition lists, "Label: value" lines; labels in
English, French, German, Dutch, Norwegian, Danish, Swedish and Spanish), and
biographical prose ("son of A and B"). It emits `data` only if it finds a name
plus at least one dated event or relative; otherwise `noMatch`.

Generic results are less complete than a dedicated scraper. On the test pages of
the existing scrapers it reproduces about 74% of their fields
(`npm run benchmark:generic`). To turn it off:

```js
genscrape({ generic: false }).on('noMatch', function(){ /* ... */ });
```

#### noData

The `noData` event is fired when genscrape is run on a page that a parser is
registered for but the parser was unable to find any data.

In cases of one-page apps such as the FamilySearch Family Tree and the findmypast
trees, you may see multiple `noData` and `data` events as the user browses through
the tree.

#### error

The `error` event is fired when something unexpected occurs while a scraper is
processing, such as a failed AJAX call. There is no standardized format for the
errors yet.

## Data Model

Data is returned in the [GEDCOM X JSON](https://github.com/FamilySearch/gedcomx/blob/master/specifications/json-format-specification.md)
format.

When possible, we mark one person as `principal`. This isn't possible when
viewing marriage records on sites that don't make a distinction between persons
in a record. The only currently supported site where this occurs is Open Archives.

Every GEDCOM X document has a [SourceDescription](https://github.com/FamilySearch/gedcomx/blob/master/specifications/conceptual-model-specification.md#source-description),
pointed to by the `about` property of the document, that provides a citation for
all data in the document. That SourceDescription points to an [Agent](https://github.com/FamilySearch/gedcomx/blob/master/specifications/conceptual-model-specification.md#agent),
via the `repository` property, which describes the website the data came from.

```json
{
  "id": "agent",
  "names": [
    {
      "lang": "en",
      "value": "Find A Grave"
    }
  ],
  "homepage": {
    "resource": "https://www.findagrave.com"
  }
}
```

We populate person's IDs with IDs from the source repository.

Person IDs aren't unique between websites. Thus we add a `genscrape`
[Identifier](https://github.com/FamilySearch/gedcomx/blob/master/specifications/conceptual-model-specification.md#identifier-type)
which allow us to better compare two arbitrary records to determine if they come
from the same record on the same website.

```json
{
  "id": "65630115",
  "identifiers": {
    "genscrape": [
      "genscrape://findagrave/65630115"
    ]
  }
}
```

## Supported Sites

* [Ancestry.com](http://ancestry.com), [Ancestry.ca](http://ancestry.ca), [Ancestry.co.uk](http://ancestry.co.uk), [Ancestry.com.au](http://ancestry.com.au), both historical records and tree profiles.
* [BillionGraves](http://billiongraves.com/)
* [Find A Grave](http://www.findagrave.com/)
* [findmypast.com](http://www.findmypast.com), [findmypast.co.uk](http://www.findmypast.co.uk), [findmypast.com.au](http://www.findmypast.com.au), [findmypast.ie](http://www.findmypast.ie), both historical records and tree profiles.
* [FamilySearch.org](https://familysearch.org), both historical records and tree profiles.
* [Genealogie Online](https://www.genealogieonline.nl)
* [MyHeritage](https://www.myheritage.com) historical records and tree profiles
* [Open Archives](https://www.openarch.nl)
* [WeRelate](http://www.werelate.org/)
* [WikiTree](https://www.wikitree.com/) person profiles
* [ABMC](https://www.abmc.gov) (American Battle Monuments Commission) profile pages
* [Archieven.nl](https://www.archieven.nl) civil registration record details (birth, marriage, death)
* [Australian War Memorial](https://www.awm.gov.au) Roll of Honour records
* [Canadian Virtual War Memorial](https://www.veterans.gc.ca/eng/remembrance/memorials/canadian-virtual-war-memorial)
* [Digitalarkivet](https://www.digitalarkivet.no) (Norwegian National Archives) census and church book person records
* [FamilySearch Ancestors](https://ancestors.familysearch.org) public person pages
* [Fold3](https://www.fold3.com) memorial pages
* [FreeCEN](https://www.freecen.org.uk) census record details
* [FreeREG](https://www.freereg.org.uk) baptism, marriage and burial record details
* [GEDBAS](https://gedbas.genealogy.net) person pages
* [Geneanet](https://gw.geneanet.org) family tree person pages
* [Geni](https://www.geni.com) person profiles
* [IrishGenealogy.ie](https://www.irishgenealogy.ie) civil (birth, marriage, death) and church (baptism, marriage, burial) record views
* [Legacy.com](https://www.legacy.com) obituaries
* [Rodovid](https://rodovid.org) person pages
* [thePeerage.com](https://www.thepeerage.com) person entries

Other sites are handled by the generic extractor described above.
