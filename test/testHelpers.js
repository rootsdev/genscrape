var debug = require('debug')('testHelpers'),
    env = require('jsdom').env;
    
module.exports = {
  
  /**
   * Setup a mock window object with
   * the specified location
   */
  mockWindow: function(location, callback){
    debug('mockWindow', location);
    env({
      html: '<html></html>',
      url: location,
      done: function(errors, window){
        if(errors){
          debug(errors);
        }
        GLOBAL.window = window;
        callback(errors, window);
      }
    });
  },
  
  /**
   * Creates a window and DOM from the
   * HTML at `filePath` with the url of `location`
   */
  mockDom: function(location, filePath, callback){
    debug('mockDom', location);
    env({
      file: filePath,
      url: location,
      done: function(errors, window){
        if(errors){
          debug(errors);
        }
        GLOBAL.window = window;
        callback(errors, window);
      }
    });
  }
  
};