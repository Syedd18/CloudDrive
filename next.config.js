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
};

module.exports = nextConfig;
