module.exports = function parseUrlAsView (_url, v, error){
  options = {
    prefix: undefined
  };
  // todo: keep track of level found, if we 404'd in a found level, show last known parent
  var parts = require('url').parse(_url).pathname.replace(options.prefix, '').split('/');
  parts.shift();
  // Remark: special case for root with no index, should be refactored
  if (parts.length === 1 && parts[0] === "" && !v['index']) {
    if (error !== false) {
      return missingViewHandler();
    }
    return v
  }
  var previousView;
  var foundViews = 0;
  parts.forEach(function(part) {
    if(part.length > 0 && typeof v !== 'undefined') {
      previousView = v || v[part];
      v = v[part];
      foundViews++;
    }
  });
  if (v && v['index']) {
    v = v['index'];
  }
  return v;
}