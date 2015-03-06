Testing is going to be a bear. Tests need to run in node or phantomJS. If node
then we'll need to save HTML docs for testing. The problem with testing in
phantomJS is that some content we want to test against is behind paywalls. But
testing with saved HTML docs makes it difficult for us to test sites like
the FS tree where content is loaded dynamically. MyHeritage does this sometimes
too.

For static content we save an HTML file. For dynamic content we do an http mock.

Could use nock for the http mocks.