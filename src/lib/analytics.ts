/**
 * Cloudflare Web Analytics: compta visites de manera agregada, sense galetes ni
 * identificadors (no cal demanar consentiment). Només s'activa si hi ha token,
 * és a dir, al build de producció. També compta els canvis de pàgina de l'SPA.
 */
export function startAnalytics() {
  const token = import.meta.env.VITE_CF_ANALYTICS_TOKEN;
  if (!token) return;
  const script = document.createElement('script');
  script.defer = true;
  script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  script.dataset.cfBeacon = JSON.stringify({ token });
  document.head.appendChild(script);
}
