/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,

  // Recompile everything modern to eliminate 12 KiB legacy polyfills
  transpilePackages: [
    'react-slick',
    'slick-carousel',
    'react-international-phone',
    '@szhsin/react-accordion',
    'lucide-react',
    'dayjs',
    'axios',
    'react-loader-spinner',
    'react-spinners',
    'google-libphonenumber',
    'react-hot-toast',
    'react-markdown',
    'remark-gfm',
    'remark-math',
    'rehype-katex',
    'rehype-raw',
    'jsonwebtoken',
    'jwt-decode',
    'clsx',
    'tailwind-merge'
  ],

  // Enable image optimization for better LCP
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  reactStrictMode: true,

  // Enable compression
  compress: true,

  // Optimize production builds
  swcMinify: true,
  productionBrowserSourceMaps: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Optimize CSS - Next.js automatically removes unused CSS in production
  // Combined with PurgeCSS in postcss.config.js for maximum optimization
  optimizeFonts: true,

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },

  // Modularize heavy imports - reduces unused JS significantly
  modularizeImports: {
    'react-icons/?(((\\w*)?/?)*)': {
      transform: 'react-icons/{{ matches.[1] }}/{{ member }}',
      skipDefaultConversion: true,
    },
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{ kebabCase member }}',
    },
  },

  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      'react-icons',
      'react-icons/io',
      'react-icons/io5',
      'react-icons/md',
      'react-icons/gi',
      'react-icons/fa',
      'react-icons/si',
      'react-slick',
      'slick-carousel',
      '@szhsin/react-accordion',
      'react-spinners',
      'react-loader-spinner',
      'dayjs',
      'axios',
      'jsonwebtoken',
      'react-markdown',
      'jwt-decode',
      'clsx',
      'tailwind-merge'
    ],
  },

  // Webpack optimizations for smaller bundles
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Replace moment with dayjs (much smaller) - safe alias
      config.resolve.alias = {
        ...config.resolve.alias,
        'moment': 'dayjs',
      };
      // MongoDB optional dependencies should never be bundled for browser.
      config.resolve.fallback = {
        ...config.resolve.fallback,
        aws4: false,
        kerberos: false,
        snappy: false,
        '@mongodb-js/zstd': false,
        'mongodb-client-encryption': false,
      };
    }
    return config;
  },

  // Headers for caching static assets and enabling bfcache
  async headers() {
    const isProd = process.env.NODE_ENV === 'production';
    return [
      // Security headers for all pages
      {
        source: '/:path*',
        headers: [
          ...(isProd
            ? [
              {
                key: 'Content-Security-Policy',
                value: 'upgrade-insecure-requests',
              },
            ]
            : []),
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
      // Static assets - immutable cache
      {
        source: '/:all*(svg|jpg|png|webp|avif|ico|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // JS/CSS chunks - immutable cache
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // HTML pages - enable bfcache by NOT setting no-store
      // bfcache requires: no unload listeners, no Cache-Control: no-store
      {
        source: '/((?!api).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          // Permissions-Policy to help with bfcache
          {
            key: 'Permissions-Policy',
            value: 'unload=()',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
