const withCss             = require('@zeit/next-css');
const withSass            = require('@zeit/next-sass');
const commonsChunkConfig  = require('@zeit/next-css/commons-chunk-config');
const CompressionPlugin   = require('compression-webpack-plugin')
const withOptimizedImages = require('next-optimized-images');
const withFonts           = require('next-fonts');

let config = withFonts(withOptimizedImages(withSass(withCss({
  webpack(config) {
    config = commonsChunkConfig(config, /\.(sass|scss|css)$/);
    config.plugins.slice(-1)[0].filename = 'static/application-[contenthash].css';
    config.plugins.push(new CompressionPlugin({
      test: /\.(css|js|svg|eot|ttf)$/,
      minRatio: 100000
    }));
    return config;
  }
}))))

config.useFileSystemPublicRoutes = false;
module.exports = config;