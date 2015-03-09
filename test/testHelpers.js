var url = require('url');

module.exports = {
  
  /**
   * Setup a mock window object with
   * the specified location
   */
  mockWindow: function(windowUrl){
    GLOBAL.window = {
      location: url.parse(windowUrl)
    };
  }
  
};