/** @type {import('next').NextConfig} */
const path = require("path");
require('dotenv').config()
module.exports = {
  images: {
    unoptimized: true,
    domains: ['firebasestorage.googleapis.com', 'static.vecteezy.com', 'storage.googleapis.com'],
  },
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/',
      },
    ]
  },
  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      "react/jsx-runtime": path.resolve(__dirname, "node_modules/react/jsx-runtime"),
    };
    return config;
  },
}
