import './globals.css'

export const metadata = {
  title: 'Pronos · Mondial 2026',
  description: 'Concours de pronostics — Coupe du Monde 2026',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Pronos 2026',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-touch-icon.png',
  },
  themeColor: '#0c1e52',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body style={{ background: '#f0f2f8' }}>
        <header style={{
          background: '#0c1e52',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <span style={{ fontSize: 20 }}>⚽</span>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 15, letterSpacing: '-0.3px' }}>
                Mondial 2026
                <span style={{ color: '#5a7fc0', fontWeight: 400, marginLeft: 6, fontSize: 13 }}>Pronos</span>
              </span>
            </a>
            <nav style={{ display: 'flex', gap: 24 }}>
              <a href="/" style={{ color: '#8aaad8', fontSize: 13, fontWeight: 500, textDecoration: 'none', letterSpacing: '0.02em' }}
                className="hover:text-white transition-colors">Classement</a>
              <a href="/matchs" style={{ color: '#8aaad8', fontSize: 13, fontWeight: 500, textDecoration: 'none', letterSpacing: '0.02em' }}
                className="hover:text-white transition-colors">Matchs</a>
              <a href="/stats" style={{ color: '#8aaad8', fontSize: 13, fontWeight: 500, textDecoration: 'none', letterSpacing: '0.02em' }}
                className="hover:text-white transition-colors">Stats</a>
              <a href="/pronos" style={{ color: '#f0b429', fontSize: 13, fontWeight: 700, textDecoration: 'none', letterSpacing: '0.02em' }}
                className="hover:opacity-80 transition-opacity">🎯 Pronos</a>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}
