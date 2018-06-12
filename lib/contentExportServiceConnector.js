'use strict';

const request = require('request');
const crypto = require('crypto');
const fs = require('fs');
const nconf = module.parent.parent.require('nconf');

module.exports = function (config) {

  const ContentExportServiceConnector = {};

  const path = config.sslCryptoPrivateKeyPath || nconf.get('content-export:sslCryptoPrivateKeyPath');
  const  privatKeyText = fs.readFileSync(`${__dirname}/../${path}`, 'utf8');
//regular expression for Markdown links
  const regexpLinks = /\[(.*)\]\((.*)\)/ig;

  ContentExportServiceConnector.storeMessage = function (req) {
    const files = getFilesArray(req.content);
    const message =  {
      text: req.content,
      userId: req.uid,
      files: files
    };
    return encryptMessage(message);
  };

  /**
   *
   * @param {Object} message
   * @returns {string}
   */
  function encryptMessage(message) {
    const source = new Buffer(JSON.stringify(message));
    //maximal length of encrypted chunk
    const maxlengthChunk = 64;
    const countOfParts = Math.ceil(source.byteLength / maxlengthChunk);

    let wholeEncrypt = new Buffer('');
    for (let part = 0; part < countOfParts; ++part) {
      const buffer = source.slice(part * maxlengthChunk, (part + 1) * maxlengthChunk);

      const encrypt = crypto.publicEncrypt({
        key: privatKeyText,
        passphrase: config.sslCryptoPrivateKeyPassPhrase || nconf.get('content-export:sslCryptoPrivateKeyPassPhrase'),
        padding: crypto.constants.RSA_PKCS1_PADDING
      }, buffer);
      wholeEncrypt = Buffer.concat([wholeEncrypt, encrypt]);
    }

    return wholeEncrypt.toString('base64');
  }

  /**
   *
   * @param {string} message
   * @returns {Promise<any>}
   */
  ContentExportServiceConnector.sentToContentExportService = function (message) {
    console.log(message);
    const contentExportService = config.contentExportService ||
      nconf.get('content-export:contentExportService');
    return new Promise((resolve, reject) => {
      request({
        url: `${contentExportService}/queue/add`,
        method: 'PUT',
        body: message
      }, function (error, response, body) {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      })
    });
  };

  /**
   *
   * @param {string} message
   * @returns {Array}
   */
  function getFilesArray(message) {
    let link;
    const result = [];
    while (link = regexpLinks.exec(message)) {
      //to save only relative links
      if (!/.*:\/\//ig.test(link[2]) && /^\//g.test(link[2])) {
        result.push({ url: getFullUrl(link[2]), description: link[1] });
      }
    }
    return result;
  }

  /**
   *
   * @param {string} url
   * @returns {*}
   */
  function getFullUrl(url) {
    return nconf.get('url') + url;
  }

  return ContentExportServiceConnector;
};
