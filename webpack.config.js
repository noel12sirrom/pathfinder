// webpack.config.js
const webpack = require('webpack');
const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  // ... other configurations ...
  plugins: [
    new webpack.DefinePlugin({
      'process.env.GOOGLE_MAPS_API_KEY': JSON.stringify(process.env.GOOGLE_MAPS_API_KEY),
    }),
  ],
};