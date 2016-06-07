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
    this.addName(GedcomX.Name.createFromString(name));
  }
  return this;
};

/**
 * Create a Name from a single string.
 * 
 * @param {String} nameString
 * @returns {Name}
 */
GedcomX.Name.createFromString = function(name){
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
    
    return GedcomX.Name().addNameForm(nameForm);
  }
};

/**
 * Find the first person in the document that matches by the specified name
 * 
 * @param {Name} name
 * @returns {Person}
 */
GedcomX.prototype.findPersonByName = function(name){
  for(var i = 0; i < this.persons.length; i++){
    if(this.persons[i].hasName(name)){
      return this.persons[i];
    }
  }
};

/**
 * Check whether this person has this name
 * 
 * @param {Name} name
 * @returns {Boolean}
 */
GedcomX.Person.prototype.hasName = function(name){
  for(var i = 0; i < this.names.length; i++){
    if(this.names[i].matches(name)){
      return true;
    }
  }
  return false;
};

/**
 * Check whether this name matches the given name. Names match if they have
 * at least one matching NameForm.
 * 
 * @param {Name} name
 * @returns {Boolean}
 */
GedcomX.Name.prototype.matches = function(name){
  for(var i = 0; i < this.nameForms.length; i++){
    if(name.hasNameForm(this.nameForms[i])){
      return true;
    }
  }
  return false;
};

/**
 * Check whether this name has a NameForm that matches the given NameForm.
 * 
 * @param {NameForm} nameForm
 * @returns {Boolean}
 */
GedcomX.Name.prototype.hasNameForm = function(nameForm){
  for(var i = 0; i < this.nameForms.length; i++){
    if(this.nameForms[i].equals(nameForm)){
      return true;
    }
  }
  return false;
};

/**
 * Check whether this NameForm equals the given NameForm.
 * 
 * @param {NameForm} nameForm
 * @returns {Boolean}
 */
GedcomX.NameForm.prototype.equals = function(nameForm){
  if(this.getLang() !== nameForm.getLang()){
    return false;
  }
  if(this.getFullText() !== nameForm.getFullText()){
    return false;
  }
  if(this.getParts().length !== nameForm.getParts().length){
    return false;
  }
  for(var i = 0; i < this.parts.length; i++){
    if(!nameForm.hasNamePart(this.parts[i])){
      return false;
    }
  }
  return true;
};

/**
 * Check whether this NameForm has a matching NamePart
 * 
 * @param {NamePart}
 * @returns {Boolean}
 */
GedcomX.NameForm.prototype.hasNamePart = function(namePart){
  for(var i = 0; i < this.parts.length; i++){
    if(this.parts[i].equals(namePart)){
      return true;
    }
  }
  return false;
};

/**
 * Check whether this NamePart equals another NamePart
 * 
 * @param {NamePart}
 * @returns {Boolean}
 */
GedcomX.NamePart.prototype.equals = function(namePart){
  // We are ignoring qualifiers. If this method ever gets added to gedcomx-js
  // then a conversation should be initiated about whether qualifiers should
  // be included in the comparison.
  if(this.getType() !== namePart.getType()){
    return false;
  }
  if(this.getValue() !== namePart.getValue()){
    return false;
  }
  return true;
};

/**
 * Add an ID generator to each GedcomX document. Allows you to easily generate
 * IDs that are unique within one document. Currently it's just a counter
 * that starts at 1 and increases each time it's called.
 * 
 * @returns {String}
 */
GedcomX.prototype.generateId = function(){
  if(typeof this._nextId === 'undefined'){
    this._nextId = 0;
  }
  return ++this._nextId + '';
};