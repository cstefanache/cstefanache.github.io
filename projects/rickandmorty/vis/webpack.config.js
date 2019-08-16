/* global __dirname, require, module*/

const webpack = require("webpack");
const path = require("path");
const env = require("yargs").argv.env; // use --env with webpack 2
const pkg = require("./package.json");
const HtmlWebpackPlugin = require("html-webpack-plugin");

let plugins = [
  new HtmlWebpackPlugin({
    template: "./index.html"
  })
];
let libraryName = pkg.name;

let outputFile, mode;

if (env === "build") {
  mode = "production";
  outputFile = `${libraryName}.min.js`;
} else {
  mode = "development";
  outputFile = `${libraryName}.js`;
}

const config = {
  mode: mode,
  entry: `${__dirname}/src/index.js`,
  devtool: "inline-source-map",
  output: {
    path: `${__dirname}/../../../rickandmorty`,
    filename: outputFile
    // library: libraryName,
    // libraryTarget: 'umd',
    // umdNamedDefine: true,
    // globalObject: "typeof self !== 'undefined' ? self : this"
  },
  module: {
    rules: [
      {
        test: /(\.jsx|\.js)$/,
        loader: "babel-loader",
        exclude: /(node_modules|bower_components)/
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [
          "file-loader",
          {
            loader: "image-webpack-loader",
            options: {
              bypassOnDebug: true, // webpack@1.x
              disable: true // webpack@2.x and newer
            }
          }
        ]
      }
    ]
  },
  plugins,
  resolve: {
    modules: [path.resolve("./node_modules"), path.resolve("./src")],
    extensions: [".json", ".js"]
  }
};

module.exports = config;
