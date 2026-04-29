import './globals.css'

export const metadata = {
  title: 'Pronos Mondial 2026',
  description: 'Concours de pronostics - Coupe du Monde 2026',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="bg-gray-950 text-white min-h-screen">
        <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-red-800 shadow-lg">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
            <span className="text-3xl">⚽</span>
            <div>
              <h1 className="text-xl font-bold tracking-wide">Pronos Mondial 2026</h1>
              <p className="text-xs text-blue-200">🏆 3 pts score exact · 2 pts bon vainqueur · 0 pt sinon</p>
            </div>
          </div>
          <nav className="max-w-5xl mx-auto px-4 pb-3 flex gap-6 text-sm font-medium">
            <a href="/" className="hover:text-yellow-300 transition-colors">Classement</a>
            <a href="/matchs" className="hover:text-yellow-300 transition-colors">Matchs</a>
          </nav>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
