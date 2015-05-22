var debug = require('debug')('findmpast-tree:utils');
var utils = module.exports = {};

utils.getDate = function(dateInt){
  debug('getDate:' + dateInt);
  if(dateInt){
    var dateString = '' + dateInt,
        year = dateString.substr(0, 4),
        month = dateString.substr(4, 2),
        day = dateString.substr(6, 2);
        
    if(month === '00' || day === '00'){
      return year;
    } else {
      return year + '-' + month + '-' + day;
    }
  }
};