const eccrypto = require('eccrypto');
const hasha = require('hasha');
const moment = require('moment');
const request = require('request');
const caches = {};
const API = 'https://configin.com';

function decode(obj) {
  let result = {};
  for (k in obj) {
    result[k] = Buffer.from(obj[k], 'hex');
  }

  return result;
};

function pull(hash, accessKey) {
  let date = moment().format('YYYYMMDDHH');
  let token = hasha(accessKey + hasha(accessKey + date));
  let updated = 0;

  if (caches[hash]) {
    updated = caches[hash].updated;
  }

  let options = {
    url: `${API}/api/sdk/config/${hash}/${token}?updated=${updated}`,
    json: true
  };

  request(options, (err, _, body) => {
    let { message, data } = body;

    if (err) {
      console.error('Request configin API failed, error:', err);
      return;
    }

    if (message === 'SUCCESS') {
      if (!data.cipher) {
        return;
      }

      eccrypto.decrypt(Buffer.from(accessKey, 'hex'), decode(data.cipher)).then(config => {
        caches[hash] = {
          config,
          updated: data.updated
        };
      });
    }
  });
}

exports.use = (hash, accessKey, parser) => {
  pull(hash, accessKey);
  setInterval(() => pull(hash, accessKey), 10000);

  return () => {
    if (caches[hash]) {
      return parser ? parser(caches[hash].config) : caches[hash].config;
    } else {
      return null;
    }
  };
};