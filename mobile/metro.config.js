const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for SVG files
config.resolver.assetExts.push(
  // Default asset extensions
  ...config.resolver.assetExts.filter(ext => ext !== 'svg'),
  // Add SVG as asset
  'svg'
);

// Add support for source files with custom extensions
config.resolver.sourceExts.push('svg');

module.exports = config;
