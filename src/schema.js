var schema = module.exports = {};

/**
 * Get the content of a schema property
 * 
 * @param {Element} $element DOM Element to search inside of
 * @param {String} name Property name to search for
 * @return {String}
 */
schema.queryPropContent = function($element, name){
  var $prop = schema.queryProp($element, name);
  return $prop ? $prop.content : '';
};

/**
 * Get the content of a schema property
 * 
 * @param {Element} $element DOM Element to search inside of
 * @param {Array} name Property name to search for
 * @return {String}
 */
schema.queryPropContentDeep = function($element, name){
  var $prop = schema.queryPropDeep($element, name);
  return $prop ? $prop.content : '';
};

/**
 * Get a schema property
 * 
 * @param {Element} $element DOM Element to search inside of
 * @param {Array} name Property name to search for
 * @return {Element}
 */
schema.queryPropDeep = function($element, name){
  if($element && Array.isArray(name)){
    var i = 0;
    do {
      $element = schema.queryProp($element, name[i]);
    } while (++i < name.length && $element);
    return $element;
  }
};

/**
 * Get a schema property
 * 
 * @param {Element} $element DOM Element to search inside of
 * @param {String} name Property name to search for
 * @return {Element}
 */
schema.queryProp = function($element, name){
  if($element){
    return $element.querySelector('[itemprop="' + name + '"]');
  }
};

/**
 * Get all matching schema properties
 * 
 * @param {Element} $element DOM Element to search inside of
 * @param {String} name Property name to search for
 * @return {Element}
 */
schema.queryPropAll = function($element, name){
  return Array.from($element.querySelectorAll('[itemprop="' + name + '"]'));
};

/**
 * Get an element with a matching itemtype
 * 
 * @param {Element} $element DOM Element to search inside of
 * @param {String} type Item type
 * @return {Element}
 */
schema.queryItem = function($element, type){
  return $element.querySelector('[itemtype="' + type + '"]');
};

/**
 * Get all elements with a matching itemtype
 * 
 * @param {Element} $element DOM Element to search inside of
 * @param {String} type Item type
 * @return {Element}
 */
schema.queryItemAll = function($element, type){
  return $element.querySelectorAll('[itemtype="' + type + '"]');
};