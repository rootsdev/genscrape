/**
 * Parse a table into objects. It assumes that the first row of the table
 * contains the labels and all other rows contain values.
 * 
 * @param {HTMLElement} table - An HTMLElement that contains table rows
 * @param {Object=} options - Options passed on to processTable()
 */
var VerticalTable = function(table, options){
  this.rows = [];
  this.processTable(table, options);
};

/**
 * Process the rows of the table.
 * 
 * @param {HTMLElement} table - An HTMLElement that contains table rows
 * @param {Object} options
 * @param {String=} options.rowSelector - CSS selector that matches the data rows; defaults to 'tr'
 * @param {Function=} options.labelMapper - Modify the labels. Accepts one argument, a label string. Must return a new label string.
 * @param {Function=} options.valueMapper - Modify the values. Accepts one argument, an HTMLElement. May return anything.
 */
VerticalTable.prototype.processTable = function(table, options){
  if(!table || !(typeof table.querySelectorAll === 'function')){
    return;
  }
  
  options = options || {};
  
  if(options.labelMapper && !(typeof options.labelMapper === 'function')){
    throw new Error('labelMapper must be a function');
  }
  
  if(options.valueMapper && !(typeof options.valueMapper === 'function')){
    throw new Error('valueMapper must be a function');
  }
  
  var rows = this.rows = [], // Clear any previous data
      $trs = table.querySelectorAll(options.rowSelector || 'tr'),
      headerRow = $trs[0],
      i, row, labels = [];
      
  // Parse labels from the first row
  if(headerRow){
    
    // Gather labels
    for(i = 0; i < headerRow.children.length; i++){
      labels.push(headerRow.children[i].textContent);
    }
    
    // Run the label converter
    if(options.labelMapper){
      labels = labels.map(function(l){
        return options.labelMapper(l);
      });
    }
    
    // Gather rows
    for(i = 1; i < $trs.length; i++){
      row = $trs[i];
      if(options.valueMapper){
        rows.push(zip(labels, Array.from(row.children).map(function(child){
          return options.valueMapper(child);
        })));
      } else {
        rows.push(zip(labels, row.children));
      }
    }
    
  }
};

/**
 * Get the rows
 * 
 * @param {Object[]}
 */
VerticalTable.prototype.getRows = function(){
  return this.rows;
};

/**
 * Create an object from a list of keys and a list of values.
 * Key[i] is paired with Value[i].
 * 
 * @param {String[]} keys
 * @param {Array} values
 */
function zip(keys, values){
  var obj = {};
  for(var i = 0; i < keys.length; i++){
    obj[keys[i]] = values[i];
  }
  return obj;
}

module.exports = VerticalTable;