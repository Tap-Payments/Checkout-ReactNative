const path = require('path');
const pkg = require('../package.json');

// checkout-react-native is this repository's root, not an npm dependency. An app that installs it
// from npm needs none of this, and refers to the config plugin as "checkout-react-native"
// instead of "../app.plugin.js" (see README "Expo").
module.exports = {
  dependencies: {
    [pkg.name]: {
      root: path.join(__dirname, '..'),
      platforms: { ios: {}, android: {} },
    },
  },
};
