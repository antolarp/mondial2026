const https = require('https')
const fs = require('fs')
const path = require('path')

const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY
const GH_TOKEN = process.env.GH_PAT
const GH_OWNER = 'antolarp'
const REPOS = ['mondial2026', 'mondial2026-famille', 'mondial2026-hesias', 'mondial2026-bros']
const RESULTATS_PATH = 'data/resultats.json'

// Mapping noms API (anglais) → noms dans matchs.json (français)
const TEAM_MAP = {
  'Algeria': 'Algérie',
  'Argentina': 'Argentine',
  'Australia': 'Australie',
  'Austria': 'Autriche',
  'Belgium': 'Belgique',
  'Bosnia-Herzegovina': 'Bosnie-et-Herzégovine',
  'Brazil': 'Brésil',
  'Canada': 'Canada',
  'Cape Verde Islands': 'Cap-Vert',
  'Colombia': 'Colombie',
  'Congo DR': 'RD Congo',
  'Croatia': 'Croatie',
  'Curaçao': 'Curaçao',
  'Czechia': 'Tchéquie',
  'Ecuador': 'Équateur',
  'Egypt': 'Égypte',
  'England': 'Angleterre',
  'France': 'France',
  'Germany': 'Allemagne',
  'Ghana': 'Ghana',
  'Haiti': 'Haïti',
  'Iran': 'RI Iran',
  'Iraq': 'Irak',
  'Ivory Coast': "Côte d'Ivoire",
  'Japan': 'Japon',
  'Jordan': 'Jordanie',
  'Mexico': 'Mexique',
  'Morocco': 'Maroc',
  'Netherlands': 'Pays-Bas',
  'New Zealand': 'Nouvelle-Zélande',
  'Norway': 'Norvège',
  'Panama': 'Panamá',
  'Paraguay': 'Paraguay',
  'Portugal': 'Portugal',
  'Qatar': 'Qatar',
  'Saudi Arabia': 'Arabie saoudite',
  'Scotland': 'Écosse',
  'Senegal': 'Sénégal',
  'South Africa': 'Afrique du Sud',
  'South Korea': 'République de Corée',
  'Spain': 'Espagne',
  'Sweden': 'Suède',
  'Switzerland': 'Suisse',
  'Tunisia': 'Tunisie',
  'Turkey': 'Turquie',
  'United States': 'États-Unis',
  'Uruguay': 'Uruguay',
  'Uzbekistan': 'Ouzbékistan',
}

function fetchJson(url, headers) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, res => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) }
        catch (e) { reject(new Error(`JSON parse error: ${data.slice(0, 200)}`)) }
      })
    }).on('error', reject)
  })
}

function putJson(url, body, headers) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body)
    const opts = {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
    }
    const req = https.request(url, opts, res => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => resolve({ status: res.statusCode, body: data }))
    })
    req.on('error', reject)
    req.write(payload)
    req.end()
  })
}

async function getGithubFile(repo, filePath) {
  const url = `https://api.github.com/repos/${GH_OWNER}/${repo}/contents/${filePath}`
  const data = await fetchJson(url, {
    Authorization: `Bearer ${GH_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'sync-scores-bot',
  })
  const content = JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'))
  return { content, sha: data.sha }
}

async function putGithubFile(repo, filePath, content, sha, message) {
  const url = `https://api.github.com/repos/${GH_OWNER}/${repo}/contents/${filePath}`
  const result = await putJson(url, {
    message,
    content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
    sha,
  }, {
    Authorization: `Bearer ${GH_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'sync-scores-bot',
  })
  if (result.status !== 200 && result.status !== 201) {
    throw new Error(`GitHub PUT failed (${result.status}): ${result.body.slice(0, 200)}`)
  }
}

async function syncScores(lookup) {
  console.log('Fetching scores from football-data.org...')
  const apiData = await fetchJson(
    'https://api.football-data.org/v4/competitions/2000/matches?season=2026&status=FINISHED',
    { 'X-Auth-Token': FOOTBALL_API_KEY }
  )
  const finished = apiData.matches || []
  console.log(`${finished.length} matches terminés trouvés`)

  const newScores = {}
  for (const m of finished) {
    const domFR = TEAM_MAP[m.homeTeam.name]
    const extFR = TEAM_MAP[m.awayTeam.name]
    if (!domFR || !extFR) { console.warn(`⚠️  Équipe inconnue: ${m.homeTeam.name} / ${m.awayTeam.name}`); continue }
    const matchId = lookup[`${domFR}|${extFR}`]
    if (!matchId) { console.warn(`⚠️  Match introuvable: ${domFR} vs ${extFR}`); continue }
    const score = m.score.fullTime
    if (score.home === null || score.away === null) continue
    newScores[matchId] = { domicile: score.home, exterieur: score.away }
  }

  console.log(`${Object.keys(newScores).length} scores à synchroniser`)
  if (Object.keys(newScores).length === 0) return

  for (const repo of REPOS) {
    try {
      const { content: current, sha } = await getGithubFile(repo, RESULTATS_PATH)
      let hasChanges = false
      const updated = { ...current }
      for (const [id, score] of Object.entries(newScores)) {
        const existing = current[id]
        if (!existing || existing.domicile !== score.domicile || existing.exterieur !== score.exterieur) {
          updated[id] = score
          hasChanges = true
          console.log(`  [${repo}] ${id}: ${score.domicile}-${score.exterieur}${existing ? ' (màj)' : ' (nouveau)'}`)
        }
      }
      if (!hasChanges) { console.log(`[${repo}] Scores déjà à jour.`); continue }
      await putGithubFile(repo, RESULTATS_PATH, updated, sha, `⚽ sync scores (${Object.keys(newScores).length} matchs)`)
      console.log(`✅ [${repo}] Scores mis à jour`)
    } catch (err) {
      console.error(`❌ [${repo}] Erreur scores: ${err.message}`)
    }
  }
}

async function syncScorers() {
  console.log('Fetching scorers from football-data.org...')
  const apiData = await fetchJson(
    'https://api.football-data.org/v4/competitions/2000/scorers?season=2026&limit=20',
    { 'X-Auth-Token': FOOTBALL_API_KEY }
  )
  const scorers = (apiData.scorers || []).map(s => ({
    nom: s.player.name,
    equipe: TEAM_MAP[s.team.name] || s.team.name,
    equipeEN: s.team.name,
    crest: s.team.crest,
    buts: s.goals || 0,
    assists: s.assists || 0,
    penaltys: s.penalties || 0,
    matchs: s.playedMatches || 0,
  }))

  console.log(`${scorers.length} buteurs trouvés`)
  if (scorers.length === 0) return

  for (const repo of REPOS) {
    try {
      let sha = null
      try {
        const existing = await getGithubFile(repo, 'data/scorers.json')
        // Check if content changed
        const same = JSON.stringify(existing.content) === JSON.stringify(scorers)
        if (same) { console.log(`[${repo}] Buteurs déjà à jour.`); continue }
        sha = existing.sha
      } catch {
        // File doesn't exist yet, will create it
      }
      const url = `https://api.github.com/repos/${GH_OWNER}/${repo}/contents/data/scorers.json`
      const body = {
        message: '🥅 sync buteurs',
        content: Buffer.from(JSON.stringify(scorers, null, 2)).toString('base64'),
        ...(sha ? { sha } : {}),
      }
      const res = await putJson(url, body, {
        Authorization: `Bearer ${GH_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'sync-scores-bot',
      })
      if (res.status !== 200 && res.status !== 201) throw new Error(`status ${res.status}`)
      console.log(`✅ [${repo}] Buteurs mis à jour`)
    } catch (err) {
      console.error(`❌ [${repo}] Erreur buteurs: ${err.message}`)
    }
  }
}

async function main() {
  const matchs = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/matchs.json'), 'utf-8'))
  const lookup = {}
  for (const m of matchs) {
    if (m.domicile && m.exterieur) lookup[`${m.domicile}|${m.exterieur}`] = m.id
  }

  await syncScores(lookup)
  await syncScorers()
  console.log('Sync terminé.')
}

main().catch(err => {
  console.error('Erreur fatale:', err)
  process.exit(1)
})
