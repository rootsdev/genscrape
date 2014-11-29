gen-scrape
==========

JavaScript library that aids in scraping person data off of genealogy websites.

This will essentially be half the functionality of [roots-search](https://github.com/rootsdev/roots-search); [gen-search](https://github.com/genealogysystems/gen-search) is the other half.

This is a work in progress. To be honest, I haven't even started coding yet (beyond what's already part of roots-search). It's all just in my head. There are some challenges to over come:

* __Testing__ - I figure we'll use [PhantomJS](http://phantomjs.org/) for this but authentication, for sites like Ancestry.com, will still be an issue.
* __API__ - This library will just be a utility. It is designed to function on other environments such as a browser extension or node.js app. We will need to devise an api that functions well for common use cases. It will likely be async since websites such as FamilySearch and MyHeritage load data via AJAX on some pages. Plus, in an environment like a browser extension where a use might navigate to multiple pages, there will be more than one `data` or `load` event and might even be a `no-data` event which means we might want an event driven system as opposed to just callbacks or promises.
* __Time__ - I don't have much of it.
