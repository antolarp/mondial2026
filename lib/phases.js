// lib/phases.js — Définit les phases de pronostic et leurs deadlines

// Deadlines manuelles (priorité sur calcul auto) — format ISO UTC
const DEADLINE_OVERRIDES = {
  'seiziemes': '2026-06-28T18:00:00.000Z', // 28 juin 20h CEST
  'huitiemes': '2026-07-04T16:59:00.000Z', // 4 juillet 18h59 CEST
}

export const PRONO_PHASES_CONFIG = [
  {
    id: 'groupes',
    label: 'Phase de groupes',
    shortLabel: 'Groupes',
    test: p => p.startsWith('Groupe'),
  },
  {
    id: 'seiziemes',
    label: 'Seizièmes de finale',
    shortLabel: '1/16',
    test: p => p === 'Seizièmes de finale',
  },
  {
    id: 'huitiemes',
    label: 'Huitièmes de finale',
    shortLabel: '1/8',
    test: p => p === 'Huitièmes de finale',
  },
  {
    id: 'quarts',
    label: 'Quarts de finale',
    shortLabel: 'Quarts',
    test: p => p === 'Quarts de finale',
  },
  {
    id: 'demis',
    label: 'Demi-finales',
    shortLabel: 'Demis',
    test: p => p === 'Demi-finales',
  },
  {
    id: 'finale',
    label: 'Finale & 3e place',
    shortLabel: 'Finale',
    test: p => p === 'Finale' || p === 'Troisième place',
  },
]

// Calcule la deadline d'une phase = veille du 1er match à 23:59:59
export function computePhaseDeadline(phaseMatchs) {
  if (!phaseMatchs.length) return null
  const firstDate = [...phaseMatchs]
    .map(m => new Date(m.date))
    .sort((a, b) => a - b)[0]
  const d = new Date(firstDate)
  d.setHours(d.getHours() - 1, 0, 0, 0)
  return d
}

// Retourne toutes les phases avec leur statut (pour SSR + API)
// Seule la phase dont la deadline est la plus proche dans le futur est ouverte.
export function computePronoPhases(matchs) {
  const now = new Date()

  const phases = PRONO_PHASES_CONFIG
    .map(config => {
      const phaseMatchs = matchs.filter(m => config.test(m.phase))
      if (!phaseMatchs.length) return null
      const deadline = DEADLINE_OVERRIDES[config.id]
        ? new Date(DEADLINE_OVERRIDES[config.id])
        : computePhaseDeadline(phaseMatchs)
      return {
        id: config.id,
        label: config.label,
        shortLabel: config.shortLabel,
        matchs: phaseMatchs,
        deadlineISO: deadline?.toISOString() ?? null,
        _deadline: deadline,
      }
    })
    .filter(Boolean)

  // La seule phase ouverte = celle dont la deadline est la plus proche encore dans le futur
  const prochaine = phases
    .filter(p => p._deadline && p._deadline > now)
    .sort((a, b) => a._deadline - b._deadline)[0]

  return phases.map(({ _deadline, ...p }) => ({
    ...p,
    isOpen: prochaine ? p.id === prochaine.id : false,
  }))
}
