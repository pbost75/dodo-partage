/**
 * Utilitaires pour les headers CORS
 */

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
};

/**
 * Créer une réponse NextResponse avec les headers CORS
 */
export function createCORSResponse(data: any, options: { status?: number } = {}) {
  return new Response(JSON.stringify(data), {
    status: options.status || 200,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}

/**
 * Gérer les requêtes OPTIONS (preflight)
 */
export function handleOPTIONS() {
  return new Response(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
} 