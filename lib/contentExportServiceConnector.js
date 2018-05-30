'use strict';

const request = require('request');
const crypto = require('crypto');
const fs = require('fs');
const nconf = module.parent.parent.require('nconf');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const ContentExportServiceConnector = {};

const privatKeyText = fs.readFileSync(`${__dirname}/../${nconf.get('content-export:sslCryptoPrivateKeyPath')}`, 'utf8');

//regular expression for Markdown links
const regexpLinks = /\[(.*)\]\((.*)\)/ig;

ContentExportServiceConnector.storeMessage = function (req) {
  const files = getFilesArray(req.content);
  const message =  {
    text: req.content,
    userID: req.uid,
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
      passphrase: nconf.get('content-export:sslCryptoPrivateKeyPassPhrase'),
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
  const contentExportService = nconf.get('content-export:contentExportService');
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

module.exports = ContentExportServiceConnector;
