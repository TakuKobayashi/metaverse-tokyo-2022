const configedEnv = require('dotenv').config();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: configedEnv.parsed,
}

module.exports = nextConfig
