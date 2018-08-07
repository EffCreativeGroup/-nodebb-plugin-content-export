'use strict';

let contentExportServiceConnector;
const meta = module.parent.require('./meta');
const winston = module.parent.require('winston');
const nconf = module.parent.require('nconf');
const _ = module.parent.require('underscore');
const user = module.parent.require('./user');
const topics = module.parent.require('./topics');
const async = require('async');

let library = {
  restApi: null,
  ready: false,
  settings:{
    sslCryptoPrivateKeyPath: "ssl/dev/smarshNode.key",
    sslCryptoPrivateKeyPassPhrase: undefined,
    contentExportService: undefined
  }
};

library.init = function ({ router, middleware: hostMiddleware }, callback) {

  router.get('/admin/plugins/content-export', hostMiddleware.admin.buildHeader, renderAdminPage);
  router.get('/api/admin/plugins/content-export', renderAdminPage);
  library.reloadSettings()
    .then(settings => {
      try {
        contentExportServiceConnector = require('./lib/contentExportServiceConnector')(settings);
      } catch (e) {
        contentExportServiceConnector = null;
        winston.error(`[content-export] ${e}`);
      }
      callback();
    });

};

library.appendConfig = function (config, callback) {

  callback(null, config);
};

library.addAdminNavigation = function (header, callback) {
  header.plugins.push({
    route: '/plugins/content-export',
    icon: 'fa-user-secret',
    name: 'Content Export'
  });

  callback(null, header);
};

function renderAdminPage(req, res, next) {
  res.render('admin/plugins/content-export', {});
}

library.addMiddleware = function (req, res, next) {


};

library.cleanup = function (data, callback) {

  if (typeof callback !== 'function') {
    return true;
  }

  callback();
};

library.reloadSettings = function () {
  return new Promise( (resolve, reject) => meta.settings.get('content-export', function (err, settings) {
    if (err) {
      winston.info('[content-export] Settings Error');
      reject();
    }

    library.settings = _.defaults(_.pick(settings, Boolean), library.settings);
    library.ready = true;
    winston.info('[content-export] Settings OK');
    resolve(library.settings);
  }));
};

library.savePostHook = function (req, next) {
  if (contentExportServiceConnector) {
    const mesObj = {};
    async.waterfall([
      function (next) {
        user.getUserFields(req.post.uid, ['username'], next);
      },
      function (userdata, next) {
        mesObj.user = !userdata ? 'Empty name' : `${userdata.username}(${req.post.uid})`;
        topics.getTopicsByTids([req.post.tid], req.post.uid, next);
      },
      function (topicdata, next) {
        if (req.data.title) {
          mesObj.topic = `Created topic: ${req.data.title}(${req.post.tid})`
        } else {
          mesObj.topic = 'Added comment to the topic: '
          + (!topicdata.length ? 'Empty topic' : `${topicdata[0].title}(${req.post.tid})`);
        }
        next(null, `${mesObj.topic}; by user: ${mesObj.user}; with content: ${req.data.content}`)
      },
      function (content, next) {
        req.data.content  = content;
        const message = contentExportServiceConnector.storeMessage(req);
        contentExportServiceConnector.sentToContentExportService(message);
      }
    ], next);

  }
  next(null, req);
};

module.exports = library;
