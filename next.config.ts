import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Ignore ESLint errors during build for deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Keep TypeScript checking enabled
    ignoreBuildErrors: false,
  },
  // Configuration pour supporter les deux domaines
  assetPrefix: process.env.NODE_ENV === 'production' 
    ? 'https://partage.dodomove.fr' 
    : undefined,
  // BasePath pour les URLs quand l'app est servie via /partage
  basePath: process.env.NODE_ENV === 'production' && process.env.USE_BASE_PATH === 'true'
    ? '/partage'
    : undefined,
};

export default nextConfig;
