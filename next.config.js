/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",

  // output: "standalone",
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  trailingSlash: true,
};

module.exports = nextConfig;
