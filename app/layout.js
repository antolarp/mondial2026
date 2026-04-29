import './globals.css'

export const metadata = {
  title: 'Pronos · Mondial 2026',
  description: 'Concours de pronostics — Coupe du Monde 2026',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="min-h-screen" style={{ background: '#0b0b12', color: '#e2e2ee' }}>
        <header style={{ borderBottom: '1px solid #1c1c2e', background: '#0b0b12' }}
          className="sticky top-0 z-20 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2.5 group">
              <span className="text-lg">⚽</span>
              <span className="font-semibold tracking-tight text-sm text-white">
                Mondial 2026
                <span className="ml-1.5 text-xs font-normal" style={{ color: '#52526e' }}>Pronos</span>
              </span>
            </a>
            <nav className="flex gap-8 text-sm" style={{ color: '#52526e' }}>
              <a href="/" className="hover:text-white transition-colors duration-150 tracking-wide">Classement</a>
              <a href="/matchs" className="hover:text-white transition-colors duration-150 tracking-wide">Matchs</a>
            </nav>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-6 py-10">
          {children}
        </main>
      </body>
    </html>
  )
}
