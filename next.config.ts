
import withPWAInit from "@ducanh2912/next-pwa";
import analyzer from '@next/bundle-analyzer';
import createNextIntlPlugin from 'next-intl/plugin';
const isProd = process.env.NODE_ENV === 'production';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const withBundleAnalyzer = analyzer({
  enabled: process.env.ANALYZE === 'true',
});
const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  workboxOptions: {
    skipWaiting: true,
  },
});

/** @type {import("next").NextConfig} */
const nextConfig = {
  compress: isProd,
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        pathname: '/**',
      } as const,
    ],
  },
  webpack(config: import('webpack').Configuration) {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };

    // to fix shikiji compile error
    // refs: https://github.com/antfu/shikiji/issues/23
    if (config.module && config.module.rules) {
      config.module.rules.push({
        test: /\.m?js$/,
        type: 'javascript/auto',
        resolve: {
          fullySpecified: false,
        },
      });
    }

    return config;
  },

};

export default isProd ? withNextIntl(withBundleAnalyzer(withPWA(nextConfig))) : withNextIntl(nextConfig);