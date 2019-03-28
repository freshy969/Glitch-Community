const path = require('path');



console.log('alias' + JSON.stringify(appConfig.resolve.alias, null, 2));

module.exports = async ({ config, mode }) => {
  // `mode` has a value of 'DEVELOPMENT' or 'PRODUCTION'
  // You can change the configuration based on that.
  // 'PRODUCTION' is used when building the static version of storybook.

  // Make whatever fine-grained changes you need

  config.module.rules.push({
    test: /\.styl$/,
    use: [
      'style-loader',
      {
        loader: 'css-loader?modules',
        options: {
          sourceMap: true,
          modules: true,
          localIdentName: '[name]__[local]___[hash:base64:5]',
        },
      },
      {
        loader: 'stylus-loader',
      },
    ],
    resolve: {
      extensions: ['.js'],
      alias: {
      'Components': CSS_MODULES,
      'Utils': path.resolve(__dirname, "src/utils"),
      'Curated': path.resolve(__dirname, "src/curated"),
      'Models': path.resolve(__dirname, "src/models"),
      'Shared': SHARED,
    },
    },
    include: path.resolve(__dirname, '../src/components'),
  });

  config.mode = 'development';

  // Return the altered config
  return config;
};
