import { chargerMatchs, chargerResultats } from '../../lib/scoring'
import AdminPanel from './AdminPanel'

export const dynamic = 'force-dynamic'

export default function AdminPage() {
  const matchs = chargerMatchs()
  const resultats = chargerResultats()
  return <AdminPanel matchs={matchs} resultats={resultats} />
}
