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
  // Alternative: utiliser une configuration dynamique
  // assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX || undefined,
};

export default nextConfig;
