var debug = require('debug')('testHelpers'),
    env = require('jsdom').env,
    fs = require('fs'),
    expect = require('chai').expect;

var originalDate = Date;
    
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
      done: doneHandler(callback)
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
      done: doneHandler(callback)
    });
  },
  
  /**
   * Save the output if recording or compare the output if we're not recording
   * 
   * @param {GedcomX} output- The output of genscrape for the test that will
   * be recorded or compared to a previous recording.
   * @param {String} path - The location of the recording.
   * @returns {Error} - Returns an error, if there is one
   */
  compareOrRecordOutput: function(output, path){
    debug('compareOrRecordOutput');
    try {
      
      // If we're recording, save the output
      if(process.env.GENSCRAPE_RECORDING){
        debug(`recording ${path}`);
        fs.writeFileSync(path, JSON.stringify(output.toJSON(), null, 2));
      }
      
      // If we're not recording, compare the output to what we've previously recorded
      else {
        expect(output.toJSON()).to.deep.equal(JSON.parse(fs.readFileSync(path), {encoding: 'utf8'}));
      }
    } catch(e) {
      return e;
    }
  }
};

/**
 * Finish setting up the test environment after the JSDOM is ready
 * 
 * @param {Function} callback
 * @returns {Function} The function that will be registered as the done handler.
 */
function doneHandler(callback){
  return function(errors, window){
    if(errors){
      debug(errors);
    }
    GLOBAL.window = window;
    GLOBAL.document = window.document;
    callback(errors, window);
  };
}

/**
 * In testing, we want all generated dates to be the same so we mock
 * the date object. This date is 2013-04-17T06:50:42.678Z
 * 
 * @returns {Date}
 */
function mockDate(time){
  return new originalDate(time || 1366181442678);
}

beforeEach(function(){
  GLOBAL.Date = mockDate;
  GLOBAL.Date.now = originalDate.now;
});

afterEach(function(){
  GLOBAL.Date = originalDate;
});