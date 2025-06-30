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
  // CORRECTION : Suppression du basePath qui causait le conflit
  // Le proxy Cloudflare gère maintenant le routing vers /partage
  // Pas besoin de basePath car l'app est servie depuis partage.dodomove.fr
};

export default nextConfig;
