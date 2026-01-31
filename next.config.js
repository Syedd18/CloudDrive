/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'images.unsplash.com',
      'picsum.photos',
      'ui-avatars.com',
      'shtgjlibyggqtgaqoyqg.supabase.co',
      'lh3.googleusercontent.com', // Google user avatars
    ],
  },
  // Increase body size limit for file uploads (default is 4MB)
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
};

module.exports = nextConfig;
