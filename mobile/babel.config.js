module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@/api': './src/api',
            '@/auth': './src/auth',
            '@/components': './src/components',
            '@/screens': './src/screens',
            '@/navigation': './src/navigation',
            '@/store': './src/store',
            '@/hooks': './src/hooks',
            '@/services': './src/services',
            '@/utils': './src/utils',
            '@/theme': './src/theme',
            '@/types': './src/types',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
