'use strict';

const contentExportServiceConnector = require('./lib/contentExportServiceConnector');

var library = {};

library.init = function (params, callback) {
  callback();
};

library.savePostHook = function (req, next) {
  const message = contentExportServiceConnector.storeMessage(req);
  contentExportServiceConnector.sentToContentExportService(message);
  next(null, req);
};

module.exports = library;
