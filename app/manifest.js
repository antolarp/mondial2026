export default function manifest() {
  return {
    name: 'Pronos Mondial 2026',
    short_name: 'Pronos 2026',
    description: 'Concours de pronostics — Coupe du Monde 2026',
    start_url: '/',
    display: 'standalone',
    background_color: '#0c1e52',
    theme_color: '#0c1e52',
    orientation: 'portrait',
    icons: [
      { src: '/icon.svg',     sizes: 'any',     type: 'image/svg+xml' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
