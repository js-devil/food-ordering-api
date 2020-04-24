module.exports = {
  entry: "./index",
  mode: "development",
  target: "node",
  //   node: {
  //     fs: "empty",
  //     net: "empty",
  //     tls: "empty",
  //   },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        // use: {
        //   loader: "babel-cli",
        // },
      },
    ],
  },
};
