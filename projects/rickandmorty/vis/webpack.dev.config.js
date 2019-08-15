const config = require("./webpack.config");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
let plugins = [
  new BundleAnalyzerPlugin(),
  new HtmlWebpackPlugin({
    template: "./index.html"
  })
];

module.exports = Object.assign(config, {
  entry: `${__dirname}/src/index.js`,
  plugins,
  node: {
    fs: "empty"
  },
  devServer: {
    hot: true,
    inline: true,
    clientLogLevel: "error",
    stats: {
      colors: true
    },
    proxy: {
      "/static": {
        target: "http://localhost:4500",
        pathRewrite: {
          "^/static": "./src"
        }
      }
    },
    host: "0.0.0.0",
    port: 4500
  }
});
