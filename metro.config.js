const {getDefaultConfig} = require("@expo/metro-config");

const defaultConfig = getDefaultConfig(__dirname);

// Add support for additional file extensions
defaultConfig.resolver.sourceExts.push("cjs");

// Enable better bundle optimization
defaultConfig.transformer = {
  ...defaultConfig.transformer,
  minifierPath: "metro-minify-terser",
  minifierConfig: {
    // Terser options for smaller builds
    compress: {
      drop_console: true, // Remove console.log statements
      pure_funcs: ["console.info", "console.debug", "console.warn"],
    },
  },
  assetPlugins: ["expo-asset/tools/hashAssetFiles"],
};

// Better resolution configuration
defaultConfig.resolver = {
  ...defaultConfig.resolver,
  extraNodeModules: {
    "firebase/app": require.resolve("firebase/app"),
    "firebase/firestore/lite": require.resolve("firebase/firestore/lite"),
  },
  // Optimizations for hermes
  useHermes: true,
};

module.exports = defaultConfig;
