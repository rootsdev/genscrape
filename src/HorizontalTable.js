/**
 * Parse an HTML table into key:[values] pairs
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
 * @param {Function=} options.labelConverter - Modify the labels. Accepts one argument, a label string. Must returns a new label string.
 */
HorizontalTable.prototype.processTable = function(table, options){
  if(!table || !(typeof table.querySelectorAll === 'function')){
    return;
  }
  
  options = options || {};
  
  if(options.labelConverter && !(typeof options.labelConverter === 'function')){
    throw new Error('labelConverter must be a function');
  }
  
  var rows = this.rows = {}, // Clear any previous data
      $trs = table.querySelectorAll(options.rowSelector || 'tr'),
      row, label, value;
      
  for(var i = 0; i < $trs.length; i++){
    row = $trs[i];
    label = row.children[0].textContent;
    value = row.children[1];
    
    if(options.labelConverter){
      label = options.labelConverter(label);
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
 * Does this table have any data?
 * 
 * @returns {Boolean}
 */
HorizontalTable.prototype.hasData = function(){
  return this.getLabelsCount() > 0;
};

module.exports = HorizontalTable;