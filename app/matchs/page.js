export const dynamic = 'force-dynamic'

import { chargerMatchs, chargerResultats, chargerJoueurs } from '../../lib/scoring'
import { computePronoPhases } from '../../lib/phases'
import MatchsAccordion from './MatchsAccordion'

const PHASES_ORDER = [
  'Groupe A','Groupe B','Groupe C','Groupe D','Groupe E','Groupe F',
  'Groupe G','Groupe H','Groupe I','Groupe J','Groupe K','Groupe L',
  'Seizièmes de finale','Huitièmes de finale','Quarts de finale',
  'Demi-finales','Troisième place','Finale',
]
const WRAP = { maxWidth: 1100, margin: '0 auto', padding: '0 24px' }
const WRAP_CLS = 'page-wrap'

export default function Matchs() {
  const matchs    = chargerMatchs()
  const resultats = chargerResultats()
  const joueurs   = chargerJoueurs()

  // Pour chaque match, savoir si sa phase de pronos est encore ouverte
  const pronoPhases = computePronoPhases(matchs)
  const pronosOuverts = new Set(
    pronoPhases
      .filter(p => p.isOpen)
      .flatMap(p => p.matchs.map(m => m.id))
  )

  const phases = [...new Set(matchs.map(m => m.phase))]
    .sort((a, b) => {
      const ia = PHASES_ORDER.indexOf(a), ib = PHASES_ORDER.indexOf(b)
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
    })

  return (
    <>
      <div style={{ background: 'linear-gradient(135deg, #0c1e52 0%, #16357a 55%, #0c2c60 100%)', paddingBottom: 0 }}>
        <div className={WRAP_CLS} style={{ ...WRAP, paddingTop: 40 }}>
          <p style={{ color: '#5a7fc0', fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 600 }}>
            Programme
          </p>
          <h1 style={{ fontSize: 48, fontWeight: 900, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1, margin: 0 }}>
            MATCHS
          </h1>
          <div style={{ marginTop: 32, height: 28, position: 'relative' }}>
            <svg viewBox="0 0 1200 28" preserveAspectRatio="none"
              style={{ position: 'absolute', bottom: 0, left: -24, width: 'calc(100% + 48px)', height: 28 }}>
              <path d="M0,0 C300,28 900,0 1200,20 L1200,28 L0,28 Z" fill="#f0f2f8" />
            </svg>
          </div>
        </div>
      </div>

      <div className={WRAP_CLS} style={{ ...WRAP, paddingTop: 32, paddingBottom: 60 }}>
        <MatchsAccordion
          phases={phases}
          matchs={matchs}
          resultats={resultats}
          joueurs={joueurs}
          pronosOuverts={[...pronosOuverts]}
        />
      </div>
    </>
  )
}
