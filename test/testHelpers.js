var debug = require('debug')('testHelpers'),
    env = require('jsdom').env,
    fs = require('fs'),
    expect = require('chai').expect;
    
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
        GLOBAL.document = window.document;
        callback(errors, window);
      }
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