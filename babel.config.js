// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // This line is required and it MUST be the last one.
      'react-native-reanimated/plugin',
    ],
  };
};