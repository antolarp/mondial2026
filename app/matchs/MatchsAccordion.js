'use client'

import { useState } from 'react'
import { getFlagUrl } from '../../lib/flags'

export default function MatchsAccordion({ phases, matchs, resultats, joueurs, pronosOuverts, points }) {
  const [openPhases, setOpenPhases] = useState(new Set())

  const toggle = (phase) => {
    setOpenPhases(prev => {
      const next = new Set(prev)
      next.has(phase) ? next.delete(phase) : next.add(phase)
      return next
    })
  }

  return (
    <div>
      {phases.map(phase => {
        const isOpen     = openPhases.has(phase)
        const phaseMatchs = matchs.filter(m => m.phase === phase)
        const played     = phaseMatchs.filter(m => resultats[m.id]).length

        return (
          <div key={phase} style={{ marginBottom: 8 }}>
            {/* En-tête cliquable */}
            <button onClick={() => toggle(phase)} style={{
              width: '100%', background: '#fff', border: '1px solid #e2e8f0',
              borderRadius: isOpen ? '14px 14px 0 0' : 14,
              padding: '12px 18px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <span style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                {phase}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 12, color: played === phaseMatchs.length ? '#16a34a' : '#94a3b8', fontWeight: 600 }}>
                  {played}/{phaseMatchs.length} joués
                </span>
                <span style={{ fontSize: 12, color: '#94a3b8', display: 'inline-block', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
              </div>
            </button>

            {/* Contenu */}
            {isOpen && (
              <div style={{
                background: '#fff',
                border: '1px solid #e2e8f0', borderTop: 'none',
                borderRadius: '0 0 14px 14px',
                padding: '8px 12px 12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {phaseMatchs.map(match => {
                    const res         = resultats[match.id]
                    const date        = new Date(match.date)
                    const pronosOpen  = pronosOuverts.includes(match.id)
                    const teamsUnknown = !match.domicile && !match.exterieur

                    return (
                      <div key={match.id} className="match-card-outer" style={{
                        background: '#f8fafc', borderRadius: 10,
                        border: res ? '1px solid #e8eaf2' : '1px solid #eef0f8',
                        padding: '10px 14px',
                        display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8,
                      }}>
                        <div className="match-main-row" style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: 11, color: '#cbd5e1', width: 66, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                            {date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </span>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1, minWidth: 0 }}>
                            <span style={{ fontWeight: 600, fontSize: 13, textAlign: 'right', flex: 1, color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5, minWidth: 0 }}>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{match.domicile}</span>
                              {getFlagUrl(match.domicile) && <img src={getFlagUrl(match.domicile)} style={{ width: 20, height: 'auto', borderRadius: 2, flexShrink: 0 }} alt="" />}
                            </span>

                            {res ? (
                              <span style={{ background: '#0c1e52', color: '#fff', fontWeight: 800, fontSize: 13, padding: '5px 11px', borderRadius: 9, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.05em', flexShrink: 0 }}>
                                {res.domicile} – {res.exterieur}
                              </span>
                            ) : (
                              <span style={{ background: '#f1f5f9', color: '#cbd5e1', fontSize: 11, padding: '5px 10px', borderRadius: 9, flexShrink: 0 }}>
                                vs
                              </span>
                            )}

                            <span style={{ fontWeight: 600, fontSize: 13, flex: 1, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
                              {getFlagUrl(match.exterieur) && <img src={getFlagUrl(match.exterieur)} style={{ width: 20, height: 'auto', borderRadius: 2, flexShrink: 0 }} alt="" />}
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{match.exterieur}</span>
                            </span>
                          </div>
                        </div>

                        <div className="match-pronos-row" style={{ display: 'flex', gap: 10, flexShrink: 0, alignItems: 'center' }}>
                          {teamsUnknown ? null : pronosOpen ? (
                            <span style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 4 }}>
                              🔒 <span>Pronos cachés</span>
                            </span>
                          ) : (
                            joueurs.map(joueur => {
                              const prono = joueur.pronos[match.id]
                              const pts   = points?.[joueur.nom]?.[match.id] ?? null
                              return (
                                <div key={joueur.nom} style={{ textAlign: 'center', minWidth: 34 }}>
                                  <p style={{ fontSize: 9, color: '#cbd5e1', marginBottom: 1 }}>{joueur.nom.slice(0, 3)}</p>
                                  <p style={{ fontSize: 11, fontWeight: 600, color: '#64748b', fontVariantNumeric: 'tabular-nums' }}>
                                    {prono ? `${prono.domicile}-${prono.exterieur}` : '—'}
                                  </p>
                                  {pts === 3 && <p style={{ fontSize: 9, fontWeight: 700, color: '#16a34a' }}>+3</p>}
                                  {pts === 2 && <p style={{ fontSize: 9, fontWeight: 700, color: '#b8922a' }}>+2</p>}
                                  {pts === 0 && <p style={{ fontSize: 9, fontWeight: 700, color: '#e2e8f0' }}>0</p>}
                                </div>
                              )
                            })
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
