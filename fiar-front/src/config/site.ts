/**
 * URL canónica del sitio para og:url, canonical links y redirects.
 * Debe coincidir con el dominio de producción real.
 *
 * Producción: https://fiar.humanizar.cloud (Pistis/Fiar por Prizma)
 * Staging: definir en NEXT_PUBLIC_SITE_URL
 * Desarrollo: definir en .env.local
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fiar.humanizar.cloud';
