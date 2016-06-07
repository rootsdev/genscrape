/**
 * Parse a horizontal HTML table into key:value[] pairs. It assumes there are
 * two columns with the first column being the label and the second column
 * being the value.
 * 
 * @param {HTMLElement} table - An HTMLElement that contains table rows
 * @param {Object=} options - Options passed on to processTable()
 */
var HorizontalTable = function(table, options){
  this.rows = {};
  this.processTable(table, options);
};

/**
 * Process the rows of an HTML table
 * 
 * @param {HTMLElement} table - An HTMLElement that contains table rows
 * @param {Object} options
 * @param {String=} options.rowSelector - CSS selector that matches the data rows; defaults to 'tr'
 * @param {Function=} options.labelMapper - Modify the labels. Accepts one argument, a label string. Must return a new label string.
 */
HorizontalTable.prototype.processTable = function(table, options){
  if(!table || !(typeof table.querySelectorAll === 'function')){
    return;
  }
  
  options = options || {};
  
  if(options.labelMapper && !(typeof options.labelMapper === 'function')){
    throw new Error('labelMapper must be a function');
  }
  
  var rows = this.rows = {}, // Clear any previous data
      $trs = table.querySelectorAll(options.rowSelector || 'tr'),
      row, label, value;
      
  for(var i = 0; i < $trs.length; i++){
    row = $trs[i];
    label = row.children[0].textContent;
    value = row.children[1];
    
    if(options.labelMapper){
      label = options.labelMapper(label);
    }
    
    if(typeof rows[label] === 'undefined'){
      rows[label] = [];
    }
    
    rows[label].push(value);
  }
};

/**
 * Get the values for a given label
 * 
 * @param {String} label
 * @returns {HTMLElement[]} data values
 */
HorizontalTable.prototype.getValues = function(label){
  return this.rows[label] || [];
};

/**
 * Get the first value for a given label
 * 
 * @param {String} label
 * @returns {HTMLElement} value
 */
HorizontalTable.prototype.getValue = function(label){
  return this.getValues(label)[0];
};

/**
 * Get the text of the first value for a label
 * 
 * @returns {String} text
 */
HorizontalTable.prototype.getText = function(label){
  var value = this.getValue(label);
  return value ? value.textContent : '';
};

/**
 * Get the list of labels
 * 
 * @returns {String[]} list of labels
 */
HorizontalTable.prototype.getLabels = function(){
  return Object.keys(this.rows);
};

/**
 * Get the number of distinct labels that this table has
 * 
 * @returns {Integer}
 */
HorizontalTable.prototype.getLabelsCount = function(){
  return this.getLabels().length;
};

/**
 * Get a list of labels that match the given regex
 * 
 * @param {RegExp} pattern
 * @returns {String[]} labels
 */
HorizontalTable.prototype.getLabelsMatch = function(pattern){
  return this.getLabels().filter(function(label){
    return pattern.test(label);
  });
};

/**
 * Check whether a given label exists
 * 
 * @param {String} label
 * @returns {Boolean}
 */
HorizontalTable.prototype.hasLabel = function(label){
  return typeof this.rows[label] !== 'undefined';
};

/**
 * Check whether the given regex matches any labels.
 * 
 * Don't call this method if you also plan on calling getLabelsMatch()
 * because you're just repeating effort. This method is useful in cases
 * where you want to call getLabelsMatch() just to check whether the length
 * is non-zero. An example would be checking for any label that has "Father"
 * in it to see if you should process father data.
 * 
 * @param {RegExp} pattern
 * @returns {Boolean}
 */
HorizontalTable.prototype.hasMatch = function(match){
  return this.getLabelsMatch(match).length > 0;
};

/**
 * Get the first value of the first label that matches the given regex.
 * 
 * @param {RegExp} pattern
 * @returns {HTMLElement}
 */
HorizontalTable.prototype.getMatch = function(pattern){
  var label = this.getLabelsMatch(pattern)[0];
  if(label){
    return this.getValue(label);
  }
};

/**
 * Get the text of the cell from the first label that matches
 * the given regex
 * 
 * @param {RegExp} pattern
 * @returns {String}
 */
HorizontalTable.prototype.getMatchText = function(pattern){
  var match = this.getMatch(pattern);
  return match ? match.textContent : '';
};

/**
 * Does this table have any data?
 * 
 * @returns {Boolean}
 */
HorizontalTable.prototype.hasData = function(){
  return this.getLabelsCount() > 0;
};

module.exports = HorizontalTable;