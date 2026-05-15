const WRAP = { maxWidth: 720, margin: '0 auto', padding: '0 24px' }

export const metadata = {
  title: 'Règles · Mondial 2026',
}

export default function Regles() {
  return (
    <>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0c1e52 0%, #16357a 55%, #0c2c60 100%)' }}>
        <div className="page-wrap" style={{ ...WRAP, paddingTop: 40 }}>
          <p style={{ color: '#5a7fc0', fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 600 }}>
            Comment jouer
          </p>
          <h1 style={{ fontSize: 48, fontWeight: 900, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1, margin: 0 }}>
            RÈGLES
          </h1>
          <div style={{ marginTop: 32, height: 28, position: 'relative' }}>
            <svg viewBox="0 0 1200 28" preserveAspectRatio="none"
              style={{ position: 'absolute', bottom: 0, left: -24, width: 'calc(100% + 48px)', height: 28 }}>
              <path d="M0,0 C300,28 900,0 1200,20 L1200,28 L0,28 Z" fill="#f0f2f8" />
            </svg>
          </div>
        </div>
      </div>

      <div className="page-wrap" style={{ ...WRAP, paddingTop: 32, paddingBottom: 60 }}>

        {/* Principe */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '28px', border: '1px solid #e8eaf2', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0c1e52', marginBottom: 12 }}>
            🎯 Le principe
          </h2>
          <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.7, margin: 0 }}>
            Avant chaque phase du tournoi, tu saisis tes pronostics pour tous les matchs de la phase.
            Une fois la date limite passée, plus moyen de modifier. Les points sont attribués automatiquement
            dès qu'un résultat est entré par l'admin.
          </p>
        </div>

        {/* Système de points */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600, marginBottom: 12 }}>
            Système de points
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* 3 pts */}
            <div style={{
              background: '#fff', borderRadius: 16, padding: '20px 24px',
              border: '2px solid #bbf7d0', boxShadow: '0 2px 8px rgba(22,163,74,0.08)',
              display: 'flex', alignItems: 'center', gap: 20,
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16, flexShrink: 0,
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>+3</span>
              </div>
              <div>
                <p style={{ fontWeight: 800, fontSize: 16, color: '#0f172a', marginBottom: 4 }}>Score exact</p>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                  Tu as prédit le score précis du match.
                  <br />
                  <span style={{ color: '#94a3b8', fontSize: 12 }}>Exemple : tu dis 2-1, le match finit 2-1 ✅</span>
                </p>
              </div>
            </div>

            {/* 2 pts */}
            <div style={{
              background: '#fff', borderRadius: 16, padding: '20px 24px',
              border: '2px solid #fde68a', boxShadow: '0 2px 8px rgba(234,179,8,0.08)',
              display: 'flex', alignItems: 'center', gap: 20,
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16, flexShrink: 0,
                background: 'linear-gradient(135deg, #d97706, #b45309)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>+2</span>
              </div>
              <div>
                <p style={{ fontWeight: 800, fontSize: 16, color: '#0f172a', marginBottom: 4 }}>Bon vainqueur</p>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                  Tu as prédit le bon gagnant (ou le match nul), mais pas le score exact.
                  <br />
                  <span style={{ color: '#94a3b8', fontSize: 12 }}>Exemple : tu dis 2-0, le match finit 3-1 → même gagnant ✅</span>
                </p>
              </div>
            </div>

            {/* 0 pts */}
            <div style={{
              background: '#fff', borderRadius: 16, padding: '20px 24px',
              border: '1px solid #e8eaf2', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              display: 'flex', alignItems: 'center', gap: 20,
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16, flexShrink: 0,
                background: '#f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 24, fontWeight: 900, color: '#94a3b8' }}>0</span>
              </div>
              <div>
                <p style={{ fontWeight: 800, fontSize: 16, color: '#0f172a', marginBottom: 4 }}>Mauvais pronostic</p>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                  Le gagnant prédit est différent du vrai résultat.
                  <br />
                  <span style={{ color: '#94a3b8', fontSize: 12 }}>Exemple : tu dis France gagne, mais c'est un nul ❌</span>
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Phases */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '28px', border: '1px solid #e8eaf2', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0c1e52', marginBottom: 16 }}>
            📅 Les phases
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Phase de groupes', desc: 'Tous les matchs de poules (72 matchs). Tu paries en une seule fois avant le coup d\'envoi du premier match.', deadline: 'J-1 avant le 1er match des groupes' },
              { label: 'Seizièmes de finale', desc: '32 matchs à élimination directe.', deadline: 'J-1 avant le 1er seizième' },
              { label: 'Huitièmes de finale', desc: '16 matchs.', deadline: 'J-1 avant le 1er huitième' },
              { label: 'Quarts de finale', desc: '8 matchs.', deadline: 'J-1 avant le 1er quart' },
              { label: 'Demi-finales', desc: '2 matchs.', deadline: 'J-1 avant la 1ère demi' },
              { label: 'Finale + 3e place', desc: 'Les deux derniers matchs.', deadline: 'J-1 avant le match pour la 3e place' },
            ].map(({ label, desc, deadline }) => (
              <div key={label} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0c1e52', flexShrink: 0, marginTop: 6 }} />
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 2 }}>{label}</p>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.5 }}>{desc}</p>
                  <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>⏰ Fermeture : {deadline}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Infos pratiques */}
        <div style={{ background: '#eff6ff', borderRadius: 16, padding: '20px 24px', border: '1px solid #bfdbfe' }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: '#1e40af', marginBottom: 10 }}>💡 Bon à savoir</p>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#475569', lineHeight: 2 }}>
            <li>Les pronos des autres joueurs sont <strong>cachés</strong> tant que la phase est ouverte</li>
            <li>Une fois la date limite passée, tu ne peux plus modifier tes pronos</li>
            <li>Le classement et les points se mettent à jour automatiquement</li>
            <li>Ton PIN personnel est requis à chaque connexion</li>
          </ul>
        </div>

      </div>
    </>
  )
}
