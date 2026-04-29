import './globals.css'

export const metadata = {
  title: 'Pronos Mondial 2026',
  description: 'Concours de pronostics — Coupe du Monde 2026',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="bg-zinc-950 text-white min-h-screen">
        <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚽</span>
              <div>
                <h1 className="text-base font-black tracking-tight leading-tight">Pronos Mondial 2026</h1>
                <p className="text-xs text-zinc-500">🏆 3pts · ✓ 2pts · ✗ 0pt</p>
              </div>
            </div>
            <nav className="flex gap-6 text-sm font-medium text-zinc-400">
              <a href="/" className="hover:text-white transition-colors">Classement</a>
              <a href="/matchs" className="hover:text-white transition-colors">Matchs</a>
            </nav>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
