const eccrypto = require('eccrypto');
const hasha = require('hasha');
const moment = require('moment');
const request = require('request');
const schedule = require('node-schedule');
const caches = {};
const API = 'https://configin.com';

function decode(obj) {
  const result = {};
  for (k in obj) {
    result[k] = Buffer.from(obj[k], 'hex');
  }

  return result;
};

function pull(hash, accessKey, verbose) {
  const date = moment().format('YYYYMMDDHH');
  const token = hasha(accessKey + hasha(accessKey + date));
  const updated = caches[hash] ? caches[hash].updated : 0;

  const options = {
    url: `${API}/api/sdk/config/${hash}/${token}?updated=${updated}`,
    json: true,
    gzip: true,
    timeout: 5 * 1000,
  };

  request(options, (err, _, body) => {
    if (err || !body) {
      if (verbose) {
        console.error('request configin API failed, error:', err);
      }

      return;
    }

    const { message, data } = body;

    if (message === 'success') {
      if (!data.cipher) {
        return;
      }

      eccrypto.decrypt(Buffer.from(accessKey, 'hex'), decode(data.cipher)).then(config => {
        caches[hash] = {
          config,
          updated: data.updated,
        };
      });
    }
  });
}

exports.use = (hash, accessKey, parser, verbose) => {
  schedule.scheduleJob('*/10 * * * * *', async () => {
    pull(hash, accessKey, verbose);
  });

  return () => {
    if (caches[hash]) {
      return parser ? parser(caches[hash].config) : caches[hash].config;
    } else {
      return null;
    }
  };
};