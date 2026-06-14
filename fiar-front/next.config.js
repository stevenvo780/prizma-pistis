/** @type {import('next').NextConfig} */
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
}
