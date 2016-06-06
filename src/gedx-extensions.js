/**
 * This file contains extensions to the gedcomx-js module.
 * 
 * Any helper methods that could be useful in other contexts will periodically
 * be submitted to gedcomx-js as pull requests. 
 * 
 * Any extensions to the actual data model would be very specific to our usecase
 * and thus it's very unlikely that we'd submit them as PRs to the GEDCOM X spec.
 */

var GedcomX = require('gedcomx-js'),
    utils = require('./utils'),
    debug = require('debug')('genscrape:gedx-extensions');

/**
 * Given a full name as a complete string, split the name into parts and add
 * the name to the person.
 * 
 * @param {String} name
 * @returns {Person}
 */
GedcomX.Person.prototype.addSimpleName = function(name){
  if(name){
    
    var parts = utils.splitName(name),
        nameForm = GedcomX.NameForm();
    
    nameForm.setFullText(name);
    
    // Because we checked for a truthy value above, we know there is at least
    // one character in the given string and thus there is at least a given name.
    nameForm.addPart(GedcomX.NamePart({
        type: 'http://gedcomx.org/Given',
        value: parts[0]
      }));
    
    if(parts[1]){
      nameForm.addPart(GedcomX.NamePart({
        type: 'http://gedcomx.org/Surname',
        value: parts[1]
      }));
    }
    
    this.addName(GedcomX.Name().addNameForm(nameForm));
  }
  
  return this;
};

/**
 * Add an ID generator to each GedcomX document. Allows you to easily generate
 * IDs that are unique within one document. Currently it's just a counter
 * that starts at 1 and increases each time it's called.
 * 
 * @returns {String}
 */
// This little trick creates an encapsulation so that the generator method has
// access to the id var but it doesn't leak into the main file scope.
GedcomX.prototype.generateId = (function(){
  var id = 0;
  return function(){
    return ++id + '';
  };
}());