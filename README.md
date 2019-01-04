### ConfigIn NodeJS SDK

```
let configin = require('configin');

// configin.use(configHash, accessKey, [parserFunction]);
let conf = configin.use('0123456789abcdef', '9b05ea1631b1381fb2abed51c11f05f61d3fe35e3bc69a008eba95095477be8e', JSON.parse);

setInterval(() => {
  // Will get the config object.
  console.log(conf());
}, 5000);
```
