const moment = require('moment');
const request = require('request');
const caches = {};

function pull(hash) {

}

exports.use = (hash, accessKey, parser) => {
  let looper = setInterval(() => {
    pull(hash);
  }, 60 * 1000);

  pull(hash);

  return () => {
    return parser ? parser(caches[hash]) : caches[hash];
  };
};