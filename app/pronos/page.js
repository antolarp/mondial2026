import { chargerMatchs, chargerJoueurs } from '../../lib/scoring'
import { computePronoPhases } from '../../lib/phases'
import PronosPanel from './PronosPanel'

export const dynamic = 'force-dynamic'

export default function PronosPage() {
  const matchs = chargerMatchs()
  const phases = computePronoPhases(matchs)

  // Passe les joueurs sans leur code (champ sensible)
  const joueurs = chargerJoueurs().map(({ code, ...rest }) => rest)

  return <PronosPanel phases={phases} joueurs={joueurs} />
}
