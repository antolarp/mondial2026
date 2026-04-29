import './globals.css'

export const metadata = {
  title: 'Pronos · Mondial 2026',
  description: 'Concours de pronostics — Coupe du Monde 2026',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="min-h-screen" style={{ background: '#f4f4f8', color: '#111118' }}>
        <header className="sticky top-0 z-20 bg-white" style={{ borderBottom: '1px solid #e4e4ec' }}>
          <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2.5">
              <span className="text-lg">⚽</span>
              <span className="font-semibold tracking-tight text-sm" style={{ color: '#111118' }}>
                Mondial 2026
                <span className="ml-1.5 text-xs font-normal" style={{ color: '#aaaabc' }}>Pronos</span>
              </span>
            </a>
            <nav className="flex gap-8 text-sm font-medium" style={{ color: '#aaaabc' }}>
              <a href="/" className="hover:text-gray-900 transition-colors">Classement</a>
              <a href="/matchs" className="hover:text-gray-900 transition-colors">Matchs</a>
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
