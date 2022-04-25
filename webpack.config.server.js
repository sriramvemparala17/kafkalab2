const path = require("path");
const nodeExternals = require("webpack-node-externals");
const CURRENT_WORKING_DIR = process.cwd();

const config = {
  name: "server",
  entry: [path.join(CURRENT_WORKING_DIR, "./server/server.js")],
  target: "node",
  output: {
    path: path.join(CURRENT_WORKING_DIR, "/dist/"),
    filename: "server.generated.js",
    publicPath: "/dist/",
    libraryTarget: "commonjs2",
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.(ttf|eot|svg|gif|jpg|png)(\?[\s\S]+)?$/,
        use: "file-loader",
      },
      {
        test: /\.(sass|css|scss)$/,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              plugins: () => [require("autoprefixer")()],
            },
          },
          "sass-loader",
        ],
      },
    ],
  },
};

module.exports = config;
