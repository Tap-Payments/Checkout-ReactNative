const path = require('path');
const pkg = require('../package.json');

module.exports = {
  project: {
    ios: {
      // ios integrates Checkout-IOS through CocoaPods, ios-spm through Swift Package Manager.
      sourceDir: process.env.CHECKOUT_IOS_SPM === '1' ? './ios-spm' : './ios',
      automaticPodsInstallation: true,
    },
  },
  dependencies: {
    [pkg.name]: {
      root: path.join(__dirname, '..'),
      platforms: {
        // Codegen script incorrectly fails without this
        // So we explicitly specify the platforms with empty object
        ios: {},
        android: {},
      },
    },
  },
};
