export const dynamic = 'force-dynamic'

import { chargerMatchs, chargerResultats } from '../../lib/scoring'
import SuperAdminPanel from './SuperAdminPanel'

export default function SuperAdminPage() {
  const matchs    = chargerMatchs()
  const resultats = chargerResultats()
  return <SuperAdminPanel matchs={matchs} resultats={resultats} />
}
