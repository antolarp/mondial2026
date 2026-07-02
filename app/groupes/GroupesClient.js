'use client'
import { useState } from 'react'

const FLAG_MAP = {
  'Mexique': 'mx', 'Afrique du Sud': 'za', 'République de Corée': 'kr', 'Tchéquie': 'cz',
  'Canada': 'ca', 'Bosnie-et-Herzégovine': 'ba', 'États-Unis': 'us', 'Paraguay': 'py',
  'Qatar': 'qa', 'Suisse': 'ch', 'Brésil': 'br', 'Maroc': 'ma', 'Haïti': 'ht',
  'Écosse': 'gb-sct', 'Australie': 'au', 'Turquie': 'tr', 'Allemagne': 'de',
  'Curaçao': 'cw', 'Pays-Bas': 'nl', 'Japon': 'jp', "Côte d'Ivoire": 'ci',
  'Équateur': 'ec', 'Suède': 'se', 'Tunisie': 'tn', 'Espagne': 'es', 'Cap-Vert': 'cv',
  'Belgique': 'be', 'Égypte': 'eg', 'Arabie saoudite': 'sa', 'Uruguay': 'uy',
  'RI Iran': 'ir', 'Nouvelle-Zélande': 'nz', 'France': 'fr', 'Sénégal': 'sn',
  'Irak': 'iq', 'Norvège': 'no', 'Argentine': 'ar', 'Algérie': 'dz',
  'Autriche': 'at', 'Jordanie': 'jo', 'Portugal': 'pt', 'RD Congo': 'cd',
  'Angleterre': 'gb-eng', 'Croatie': 'hr', 'Ghana': 'gh', 'Panamá': 'pa',
  'Ouzbékistan': 'uz', 'Colombie': 'co',
}

const GROUP_COLORS = {
  A: '#e74c3c', B: '#e67e22', C: '#f1c40f', D: '#2ecc71',
  E: '#1abc9c', F: '#3498db', G: '#9b59b6', H: '#e91e63',
  I: '#00bcd4', J: '#ff5722', K: '#8bc34a', L: '#607d8b',
}

// Bracket: paires de seizièmes → huitième
const BRACKET_LEFT = [
  { r32a: 'M74', r32b: 'M77', r16: 'M89' },
  { r32a: 'M73', r32b: 'M75', r16: 'M90' },
  { r32a: 'M83', r32b: 'M84', r16: 'M91' },
  { r32a: 'M81', r32b: 'M82', r16: 'M92' },
]
const BRACKET_RIGHT = [
  { r32a: 'M76', r32b: 'M78', r16: 'M93' },
  { r32a: 'M79', r32b: 'M80', r16: 'M94' },
  { r32a: 'M86', r32b: 'M88', r16: 'M95' },
  { r32a: 'M85', r32b: 'M87', r16: 'M96' },
]

function Flag({ equipe, size = 18 }) {
  const code = FLAG_MAP[equipe]
  if (!code) return <span style={{ width: size, display: 'inline-block', flexShrink: 0 }} />
  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      alt={equipe}
      style={{ width: size, height: Math.round(size * 0.67), objectFit: 'cover', borderRadius: 2, flexShrink: 0, verticalAlign: 'middle' }}
    />
  )
}

function getWinner(matchId, matchsMap, resultats) {
  const m = matchsMap[matchId]
  const r = resultats[matchId]
  if (!m || !r) return null
  if (r.domicile > r.exterieur) return m.domicile
  if (r.exterieur > r.domicile) return m.exterieur
  return null
}

function TeamRow({ equipe, score, isWinner, hasResult }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '5px 10px',
      opacity: hasResult && !isWinner ? 0.38 : 1,
    }}>
      {equipe ? <Flag equipe={equipe} /> : <span style={{ width: 18, flexShrink: 0 }} />}
      <span style={{
        fontSize: 11, fontWeight: isWinner ? 700 : 500,
        color: equipe ? '#1e293b' : '#94a3b8',
        fontStyle: equipe ? 'normal' : 'italic',
        flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {equipe || 'À déterminer'}
      </span>
      {score != null && (
        <span style={{ fontSize: 12, fontWeight: 800, color: isWinner ? '#1e293b' : '#94a3b8', marginLeft: 2 }}>
          {score}
        </span>
      )}
      {isWinner && <span style={{ fontSize: 9, color: '#3b82f6' }}>✓</span>}
    </div>
  )
}

function fmtDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
    + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function R32Card({ matchId, matchsMap, resultats }) {
  const m = matchsMap[matchId]
  if (!m) return null
  const r = resultats[matchId]
  const winner = getWinner(matchId, matchsMap, resultats)
  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', minWidth: 0,
    }}>
      <div style={{ background: '#f1f5f9', padding: '2px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
        <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, letterSpacing: '0.08em' }}>{matchId}</span>
        <span style={{ fontSize: 9, color: '#64748b', fontWeight: 500 }}>{fmtDate(m.date)}</span>
      </div>
      <TeamRow equipe={m.domicile} score={r?.domicile} isWinner={winner === m.domicile} hasResult={!!r} />
      <div style={{ height: 1, background: '#f1f5f9' }} />
      <TeamRow equipe={m.exterieur} score={r?.exterieur} isWinner={winner === m.exterieur} hasResult={!!r} />
    </div>
  )
}

function R16Card({ winnerA, winnerB, r16Match }) {
  const both = winnerA && winnerB
  return (
    <div style={{
      background: both ? 'linear-gradient(135deg, #eff6ff, #dbeafe)' : '#f8fafc',
      border: `1.5px solid ${both ? '#93c5fd' : '#e2e8f0'}`,
      borderRadius: 8, overflow: 'hidden', minWidth: 0,
    }}>
      <div style={{ background: both ? '#3b82f6' : '#94a3b8', padding: '2px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
        <span style={{ fontSize: 9, color: '#fff', fontWeight: 700, letterSpacing: '0.08em' }}>8ème</span>
        {r16Match?.date && <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{fmtDate(r16Match.date)}</span>}
      </div>
      <TeamRow equipe={winnerA} isWinner={false} hasResult={false} />
      <div style={{ height: 1, background: both ? '#bfdbfe' : '#f1f5f9' }} />
      <TeamRow equipe={winnerB} isWinner={false} hasResult={false} />
    </div>
  )
}

function BracketPair({ pair, matchsMap, resultats, mirror = false }) {
  const wA = getWinner(pair.r32a, matchsMap, resultats)
  const wB = getWinner(pair.r32b, matchsMap, resultats)
  const r16Match = pair.r16 ? matchsMap[pair.r16] : null

  const r32Col = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
      <R32Card matchId={pair.r32a} matchsMap={matchsMap} resultats={resultats} />
      <R32Card matchId={pair.r32b} matchsMap={matchsMap} resultats={resultats} />
    </div>
  )
  const arrow = (
    <div style={{ color: '#cbd5e1', fontSize: 14, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
      {mirror ? '←' : '→'}
    </div>
  )
  const r16Col = (
    <div style={{ flex: 1, minWidth: 0, alignSelf: 'center' }}>
      <R16Card winnerA={wA} winnerB={wB} r16Match={r16Match} />
    </div>
  )

  return (
    <div style={{ display: 'flex', alignItems: 'stretch', gap: 6, marginBottom: 12 }}>
      {mirror ? <>{r16Col}{arrow}{r32Col}</> : <>{r32Col}{arrow}{r16Col}</>}
    </div>
  )
}

function TableauGroupe({ lettre, equipes }) {
  const couleur = GROUP_COLORS[lettre] || '#3498db'
  const matchsJoues = equipes.some(e => e.mj > 0)
  return (
    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e8eaf2', overflow: 'hidden' }}>
      <div style={{ background: `linear-gradient(135deg, ${couleur}dd, ${couleur}99)`, padding: '7px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 22, height: 22, background: 'rgba(255,255,255,0.2)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 12, color: '#fff' }}>{lettre}</div>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>Groupe {lettre}</span>
        {!matchsJoues && <span style={{ marginLeft: 'auto', fontSize: 9, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic' }}>pas commencé</span>}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #f0f2f8' }}>
            {['#','Équipe','MJ','V','N','D','BP','BC','Diff','Pts'].map((h, i) => (
              <th key={h} className={i >= 2 && i <= 7 ? 'col-hide' : ''} style={{ padding: '4px 5px', textAlign: i <= 1 ? 'left' : 'center', color: '#94a3b8', fontWeight: 600, fontSize: 9 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {equipes.map((eq, i) => {
            const qualifie = i < 2
            const troisieme = i === 2
            return (
              <tr key={eq.nom} style={{ borderBottom: i < equipes.length - 1 ? '1px solid #f4f6fb' : 'none', background: qualifie ? `${couleur}08` : troisieme ? '#fffbf0' : '#fff', borderLeft: qualifie ? `3px solid ${couleur}` : troisieme ? '3px solid #f0b429' : '3px solid transparent' }}>
                <td style={{ padding: '5px 6px', color: qualifie ? couleur : '#94a3b8', fontWeight: 700, fontSize: 10 }}>{i + 1}</td>
                <td style={{ padding: '5px 6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Flag equipe={eq.nom} size={16} />
                    <span style={{ fontWeight: qualifie ? 700 : 500, color: '#0f172a', fontSize: 11 }}>{eq.nom}</span>
                    {qualifie && <span style={{ fontSize: 8, color: couleur, fontWeight: 700, background: `${couleur}15`, padding: '1px 4px', borderRadius: 6 }}>Q</span>}
                    {troisieme && eq.mj > 0 && <span style={{ fontSize: 8, color: '#f0b429', fontWeight: 700, background: '#fef9e7', padding: '1px 4px', borderRadius: 6 }}>?</span>}
                  </div>
                </td>
                <td className="col-hide" style={{ padding: '5px 4px', textAlign: 'center', color: '#64748b' }}>{eq.mj}</td>
                <td className="col-hide" style={{ padding: '5px 4px', textAlign: 'center', color: '#22c55e', fontWeight: eq.v > 0 ? 700 : 400 }}>{eq.v}</td>
                <td className="col-hide" style={{ padding: '5px 4px', textAlign: 'center', color: '#94a3b8' }}>{eq.n}</td>
                <td className="col-hide" style={{ padding: '5px 4px', textAlign: 'center', color: '#ef4444', fontWeight: eq.d > 0 ? 700 : 400 }}>{eq.d}</td>
                <td className="col-hide" style={{ padding: '5px 4px', textAlign: 'center', color: '#64748b' }}>{eq.bp}</td>
                <td className="col-hide" style={{ padding: '5px 4px', textAlign: 'center', color: '#64748b' }}>{eq.bc}</td>
                <td style={{ padding: '5px 4px', textAlign: 'center', color: eq.diff > 0 ? '#22c55e' : eq.diff < 0 ? '#ef4444' : '#94a3b8', fontWeight: 600 }}>{eq.diff > 0 ? `+${eq.diff}` : eq.diff}</td>
                <td style={{ padding: '5px 8px', textAlign: 'center', fontWeight: 900, fontSize: 12, color: qualifie ? couleur : '#0f172a' }}>{eq.pts}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function AccordionHeader({ title, count, open, onToggle, accent = '#3b82f6' }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
        background: open ? '#fff' : '#f8fafc',
        border: `1.5px solid ${open ? accent + '50' : '#e2e8f0'}`,
        borderRadius: open ? '12px 12px 0 0' : 12,
        padding: '14px 18px',
        cursor: 'pointer', textAlign: 'left',
        transition: 'all 0.15s',
      }}
    >
      <span style={{ width: 20, height: 20, background: accent, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
        {open ? '▲' : '▼'}
      </span>
      <span style={{ fontWeight: 700, fontSize: 14, color: '#1e293b', flex: 1 }}>{title}</span>
      {count != null && (
        <span style={{ fontSize: 11, color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: 10 }}>
          {count}
        </span>
      )}
    </button>
  )
}

export default function GroupesClient({ groupes, matchsR32, matchsR16, resultats }) {
  const [groupsOpen, setGroupsOpen] = useState(false)
  const [r32Open, setR32Open] = useState(false)

  const matchsMap = {}
  matchsR32.forEach(m => { matchsMap[m.id] = m })
  matchsR16.forEach(m => { matchsMap[m.id] = m })

  const r32Done = matchsR32.filter(m => resultats[m.id]).length
  const allR32Done = r32Done === 16
  const lettres = Object.keys(groupes).sort()

  const bracketContent = (left, right) => (
    <div>
      <style>{`
        @media (max-width: 640px) {
          .bracket-grid { grid-template-columns: 1fr !important; }
          .col-hide { display: none !important; }
        }
      `}</style>
      <div className="bracket-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          {left.map((pair, i) => (
            <BracketPair key={i} pair={pair} matchsMap={matchsMap} resultats={resultats} mirror={false} />
          ))}
        </div>
        <div>
          {right.map((pair, i) => (
            <BracketPair key={i} pair={pair} matchsMap={matchsMap} resultats={resultats} mirror={true} />
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div>
      {/* ── Groupes accordion ── */}
      <div style={{ marginBottom: 24 }}>
        <AccordionHeader
          title="Phase de groupes"
          count={`${lettres.length} groupes`}
          open={groupsOpen}
          onToggle={() => setGroupsOpen(v => !v)}
          accent="#3498db"
        />
        {groupsOpen && (
          <div style={{ border: '1.5px solid #3498db50', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: 16, background: '#fdfdff' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
              {lettres.map(lettre => (
                <TableauGroupe key={lettre} lettre={lettre} equipes={groupes[lettre]} />
              ))}
            </div>
            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: '#94a3b8' }}>
              Les 2 premiers de chaque groupe + les 8 meilleurs 3èmes se qualifient pour les huitièmes.
            </p>
          </div>
        )}
      </div>

      {/* ── Bracket R32 ── */}
      {allR32Done ? (
        <div style={{ marginBottom: 24 }}>
          <AccordionHeader
            title="Seizièmes de finale"
            count={`${r32Done}/16 joués`}
            open={r32Open}
            onToggle={() => setR32Open(v => !v)}
            accent="#64748b"
          />
          {r32Open && (
            <div style={{ border: '1.5px solid #64748b50', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: 16, background: '#fdfdff' }}>
              {bracketContent(BRACKET_LEFT, BRACKET_RIGHT)}
            </div>
          )}
        </div>
      ) : (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#1e293b', letterSpacing: '-0.5px' }}>
                Seizièmes de finale
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
                {r32Done} / 16 matchs joués
              </p>
            </div>
            <div style={{ background: '#f1f5f9', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700, color: '#475569' }}>
              {r32Done}/16
            </div>
          </div>
          {bracketContent(BRACKET_LEFT, BRACKET_RIGHT)}
        </div>
      )}

      {/* ── Huitièmes (quand tous les R32 terminés) ── */}
      {allR32Done && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#1e293b', letterSpacing: '-0.5px' }}>
                Huitièmes de finale
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
                Toutes les équipes qualifiées
              </p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
            {matchsR16.map(m => {
              const r = resultats[m.id]
              const winner = r ? (r.domicile > r.exterieur ? m.domicile : m.exterieur) : null
              return (
                <div key={m.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ background: '#3b82f6', padding: '4px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                    <span style={{ fontSize: 10, color: '#fff', fontWeight: 700, letterSpacing: '0.1em' }}>{m.id} · 8ème de finale</span>
                    {m.date && <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{fmtDate(m.date)}</span>}
                  </div>
                  <TeamRow equipe={m.domicile} score={r?.domicile} isWinner={winner === m.domicile} hasResult={!!r} />
                  <div style={{ height: 1, background: '#f1f5f9' }} />
                  <TeamRow equipe={m.exterieur} score={r?.exterieur} isWinner={winner === m.exterieur} hasResult={!!r} />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
