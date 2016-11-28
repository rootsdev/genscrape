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

Or use the CDN

```html
<script src="https://unpkg.com/genscrape@1.1.1/dist/genscrape.min.js"></script>
```

## Usage

Scraping is sometimes asynchronous so we chose to implement the [EventEmitter](https://nodejs.org/api/events.html)
interface using [EventEmmitter2](https://github.com/asyncly/EventEmitter2).

```js
genscrape().on('data', function(data){
  // Do something with the data
});
```

That's it. Genscrape automatically detects what page you're on, looks up the
correct scraper, and does its magic.

### Events

#### data

The `data` event is fired when genscrape successfully scrapes data from the page.
The returned data object will be in the 
[GEDCOM X JSON](https://github.com/FamilySearch/gedcomx/blob/master/specifications/json-format-specification.md) format.

#### noMatch

The `noMatch` event is fired when genscrape is called on a page with a URL that
it does not recognize. In other words, it does not have a parser registered for
the URL.

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

## Supported Sites

* [Ancestry.com](http://ancestry.com), both historical records and tree profiles.
* [BillionGraves](http://billiongraves.com/)
* [Find A Grave](http://www.findagrave.com/)
* [findmypast.com](http://www.findmypast.com), [findmypast.co.uk](http://www.findmypast.co.uk), [findmypast.com.au](http://www.findmypast.com.au), [findmypast.ie](http://www.findmypast.ie), both historical records and tree profiles.
* [FamilySearch.org](https://familysearch.org), both historical records and tree profiles.
* [Genealogie Online](https://www.genealogieonline.nl)
* [Open Archives](https://www.openarch.nl)
* [WeRelate](http://www.werelate.org/)
* [WikiTree](http://www.wikitree.com/) person profiles
