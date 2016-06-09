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
    utils = require('./utils');
    
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

/**
 * Extend Relationship to allow person objects to be specified instead of
 * having to generate the references ourselves.
 */
var originalSetPerson1 = GedcomX.Relationship.prototype.setPerson1;
GedcomX.Relationship.prototype.setPerson1 = function(reference){
  if(GedcomX.Person.isInstance(reference)){
    reference = {
      resource: '#' + reference.getId()
    };
  }
  originalSetPerson1.call(this, reference);
};

var originalSetPerson2 = GedcomX.Relationship.prototype.setPerson2;
GedcomX.Relationship.prototype.setPerson2 = function(reference){
  if(GedcomX.Person.isInstance(reference)){
    reference = {
      resource: '#' + reference.getId()
    };
  }
  originalSetPerson2.call(this, reference);
};

/**
 * Add a relative of the specific person. This creates the new person, adds them
 * to the GedcomX document, creates a relationship, and adds the new relationship.
 * 
 * When creating parent-child relationships, the order of persons matters.
 * `person1` is the parent; `person2` is the child. We allow you to specify
 * `Child` as the relationship type, even though it doesn't exist in GedcomX,
 * so that we can easily calculate which position the person should be in.
 * 
 * @param {Person} person - An existing person that the new person is related to.
 * @param {String} name - Name of the new person
 * @param {String} relationshipType - Valid values are `Couple`,`Parent`,`Child`.
 * Use `Parent` when adding a parent of the person. Use `Child` when adding a child of the person.
 * @returns {Person} Returns the new Person object representing the relative.
 */
GedcomX.prototype.addRelativeFromName = function(person, name, relationshipType){
  
  // Create and add relative
  var relative = GedcomX.Person({
    id: this.generateId()
  }).addSimpleName(name);
  this.addPerson(relative);
  
  
  // Calculate relationship data
  var relData;
  switch(relationshipType){
    case 'Couple':
      relData = {
        type: 'http://gedcomx.org/Couple',
        person1: person,
        person2: relative
      };
      break;
    case 'Parent':
      relData = {
        type: 'http://gedcomx.org/ParentChild',
        person1: relative,
        person2: person
      };
      break;
    case 'Child':
      relData = {
        type: 'http://gedcomx.org/ParentChild',
        person1: person,
        person2: relative
      };
      break;
    default:
      throw new Error('Invalid relationship type: ' + relationshipType);
  }
  
  this.addRelationship(relData);
  
  return relative;
};