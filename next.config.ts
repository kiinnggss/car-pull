import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    root: '/home/joyboy/projects/car-pull',
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
