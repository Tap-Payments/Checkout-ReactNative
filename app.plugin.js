/**
 * Expo config plugin for checkout-react-native. Add it to app.json / app.config.js:
 *
 *   "plugins": ["checkout-react-native"]
 *   "plugins": [["checkout-react-native", { "ios": { "spm": true }, "cameraPermission": "..." }]]
 *
 * - Android: adds the JitPack repository, where Checkout-Android is published.
 * - iOS: `ios.spm: true` takes Checkout-IOS from its Swift package instead of CocoaPods
 *   (sets CHECKOUT_IOS_SPM in the Podfile, see README "iOS: Swift Package Manager").
 * - iOS: `cameraPermission` sets NSCameraUsageDescription, needed for the card scanner.
 */

// Resolve expo from the app being built (the Expo CLI runs in it), not from this package, which
// does not depend on expo.
const { withInfoPlist, withPodfile, withProjectBuildGradle } = require(
  require.resolve('expo/config-plugins', { paths: [process.cwd(), __dirname] })
);

const JITPACK = "maven { url 'https://jitpack.io' }";
const SPM_LINE = "ENV['CHECKOUT_IOS_SPM'] = '1'";

function withJitPack(config) {
  return withProjectBuildGradle(config, (mod) => {
    const gradle = mod.modResults;
    if (
      gradle.language !== 'groovy' ||
      gradle.contents.includes('jitpack.io')
    ) {
      return mod;
    }
    // The repositories every project of the app resolves dependencies from.
    gradle.contents = gradle.contents.replace(
      /allprojects\s*\{\s*repositories\s*\{/,
      (match) => `${match}\n    ${JITPACK}`
    );
    return mod;
  });
}

function withSPM(config) {
  return withPodfile(config, (mod) => {
    if (!mod.modResults.contents.includes(SPM_LINE)) {
      mod.modResults.contents = `${SPM_LINE}\n${mod.modResults.contents}`;
    }
    return mod;
  });
}

function withCameraPermission(config, text) {
  return withInfoPlist(config, (mod) => {
    mod.modResults.NSCameraUsageDescription =
      mod.modResults.NSCameraUsageDescription ?? text;
    return mod;
  });
}

module.exports = function withCheckout(config, options = {}) {
  config = withJitPack(config);
  if (options.ios?.spm) config = withSPM(config);
  if (options.cameraPermission) {
    config = withCameraPermission(config, options.cameraPermission);
  }
  return config;
};
