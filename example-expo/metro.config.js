const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withMetroConfig } = require('react-native-monorepo-config');

const root = path.resolve(__dirname, '..');
const sharedApp = path.join(root, 'example', 'src');

const config = withMetroConfig(getDefaultConfig(__dirname), {
  root,
  dirname: __dirname,
});

// The screens come from example/src. Resolve their packages (e.g. react-native-safe-area-context)
// from this app's node_modules, so the JS matches the native code this app links.
const resolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const fromSharedApp =
    context.originModulePath.startsWith(sharedApp) &&
    !moduleName.startsWith('.');
  return resolveRequest(
    fromSharedApp
      ? { ...context, originModulePath: path.join(__dirname, 'index.ts') }
      : context,
    moduleName,
    platform
  );
};

module.exports = config;
