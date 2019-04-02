function webpackBackgroundProcess() {
  // Launch webpack in a separate process because it blocks a bit
  const { spawn } = require('child_process');
  const env = { ...process.env, NODE_OPTIONS: '--max-old-space-size=384' };
  spawn('webpack', ['--watch', '--info-verbosity', 'verbose'], { env, stdio: 'inherit' });
}

function webpackExpressMiddleware() {
  const webpack = require('webpack');
  const webpackConfig = require('../webpack.config.js');
  const compiler = webpack(webpackConfig);

  const webpackMiddleware = require('webpack-dev-middleware');
  const middleware = webpackMiddleware(compiler, { writeToDisk: true });

  let ready = false;
  middleware.waitUntilValid(() => {
    ready = true;
  });

  return function(request, response, next) {
    if (ready) {
      return middleware(request, response, next);
    }
    return next();
  };
}

module.exports = function(app) {
  if (process.env.NODE_ENV === 'production') {
    webpackBackgroundProcess();
  } else {
    app.use(webpackExpressMiddleware());
  }
};