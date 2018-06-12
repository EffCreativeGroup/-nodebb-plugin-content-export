'use strict';
/* globals $, app */

define('admin/plugins/content-export', ['settings'], function (Settings) {

  var ACP = {};

  ACP.init = function () {
    Settings.load('content-export', $('.content-export-settings'));

    $('#save').on('click', function () {
      Settings.save('content-export', $('.content-export-settings'), function () {
        app.alert({
          type: 'success',
          alert_id: 'content-export-saved',
          title: 'Settings Saved',
          message: 'Theme settings saved'
        });
      });
    });
  };

  return ACP;
});
