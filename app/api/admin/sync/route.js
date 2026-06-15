import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const OWNER = process.env.GITHUB_OWNER || 'antolarp'
const REPOS = (process.env.GITHUB_REPOS_ALL || 'mondial2026').split(',').map(r => r.trim())
const GH_TOKEN = process.env.GITHUB_TOKEN
const FOOTBALL_KEY = process.env.FOOTBALL_API_KEY

const TEAM_MAP = {
  'Algeria': 'Algérie', 'Argentina': 'Argentine', 'Australia': 'Australie',
  'Austria': 'Autriche', 'Belgium': 'Belgique', 'Bosnia-Herzegovina': 'Bosnie-et-Herzégovine',
  'Brazil': 'Brésil', 'Canada': 'Canada', 'Cape Verde Islands': 'Cap-Vert',
  'Colombia': 'Colombie', 'Congo DR': 'RD Congo', 'Croatia': 'Croatie',
  'Curaçao': 'Curaçao', 'Czechia': 'Tchéquie', 'Ecuador': 'Équateur',
  'Egypt': 'Égypte', 'England': 'Angleterre', 'France': 'France',
  'Germany': 'Allemagne', 'Ghana': 'Ghana', 'Haiti': 'Haïti',
  'Iran': 'RI Iran', 'Iraq': 'Irak', 'Ivory Coast': "Côte d'Ivoire",
  'Japan': 'Japon', 'Jordan': 'Jordanie', 'Mexico': 'Mexique',
  'Morocco': 'Maroc', 'Netherlands': 'Pays-Bas', 'New Zealand': 'Nouvelle-Zélande',
  'Norway': 'Norvège', 'Panama': 'Panamá', 'Paraguay': 'Paraguay',
  'Portugal': 'Portugal', 'Qatar': 'Qatar', 'Saudi Arabia': 'Arabie saoudite',
  'Scotland': 'Écosse', 'Senegal': 'Sénégal', 'South Africa': 'Afrique du Sud',
  'South Korea': 'République de Corée', 'Spain': 'Espagne', 'Sweden': 'Suède',
  'Switzerland': 'Suisse', 'Tunisia': 'Tunisie', 'Turkey': 'Turquie',
  'United States': 'États-Unis', 'Uruguay': 'Uruguay', 'Uzbekistan': 'Ouzbékistan',
}

async function ghGet(repo, filePath) {
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${repo}/contents/${filePath}`, {
    headers: { Authorization: `Bearer ${GH_TOKEN}`, Accept: 'application/vnd.github.v3+json' },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`GET ${repo}/${filePath} → ${res.status}`)
  const data = await res.json()
  return { content: JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8')), sha: data.sha }
}

async function ghPut(repo, filePath, content, sha, message) {
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${repo}/contents/${filePath}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${GH_TOKEN}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'), sha }),
  })
  if (!res.ok) { const e = await res.json(); throw new Error(`PUT ${repo}/${filePath} → ${e.message}`) }
}

export async function GET(request) {
  // Vérification clé
  const key = new URL(request.url).searchParams.get('key')
  if (key !== (process.env.ADMIN_PASSWORD || 'mondial2026')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!GH_TOKEN || !FOOTBALL_KEY) {
    return NextResponse.json({ error: 'Missing env vars' }, { status: 500 })
  }

  const log = []
  try {
    // 1. Charger matchs depuis le repo principal
    const { content: matchs } = await ghGet('mondial2026', 'data/matchs.json')
    const lookup = {}
    for (const m of matchs) {
      if (m.domicile && m.exterieur) lookup[`${m.domicile}|${m.exterieur}`] = m.id
    }

    // 2. Scores
    const scoresRes = await fetch(
      'https://api.football-data.org/v4/competitions/2000/matches?season=2026&status=FINISHED',
      { headers: { 'X-Auth-Token': FOOTBALL_KEY }, cache: 'no-store' }
    )
    const scoresData = await scoresRes.json()
    const finished = scoresData.matches || []

    const newScores = {}
    for (const m of finished) {
      const domFR = TEAM_MAP[m.homeTeam.name]
      const extFR = TEAM_MAP[m.awayTeam.name]
      if (!domFR || !extFR) continue
      const matchId = lookup[`${domFR}|${extFR}`]
      if (!matchId) continue
      const score = m.score.fullTime
      if (score.home === null || score.away === null) continue
      newScores[matchId] = { domicile: score.home, exterieur: score.away }
    }

    for (const repo of REPOS) {
      try {
        const { content: current, sha } = await ghGet(repo, 'data/resultats.json')
        let changed = false
        const updated = { ...current }
        for (const [id, score] of Object.entries(newScores)) {
          const ex = current[id]
          if (!ex || ex.domicile !== score.domicile || ex.exterieur !== score.exterieur) {
            updated[id] = score; changed = true
          }
        }
        if (changed) {
          await ghPut(repo, 'data/resultats.json', updated, sha, `⚽ sync scores (${Object.keys(newScores).length} matchs)`)
          log.push(`✅ ${repo} scores màj`)
        } else {
          log.push(`— ${repo} scores déjà à jour`)
        }
      } catch (e) { log.push(`❌ ${repo} scores: ${e.message}`) }
    }

    // 3. Buteurs
    const scorersRes = await fetch(
      'https://api.football-data.org/v4/competitions/2000/scorers?season=2026&limit=20',
      { headers: { 'X-Auth-Token': FOOTBALL_KEY }, cache: 'no-store' }
    )
    const scorersData = await scorersRes.json()
    const scorers = (scorersData.scorers || []).map(s => ({
      nom: s.player.name,
      equipe: TEAM_MAP[s.team.name] || s.team.name,
      crest: s.team.crest,
      buts: s.goals || 0,
      assists: s.assists || 0,
      penaltys: s.penalties || 0,
      matchs: s.playedMatches || 0,
    }))

    for (const repo of REPOS) {
      try {
        let sha = null
        try {
          const existing = await ghGet(repo, 'data/scorers.json')
          if (JSON.stringify(existing.content) === JSON.stringify(scorers)) {
            log.push(`— ${repo} buteurs déjà à jour`); continue
          }
          sha = existing.sha
        } catch {}
        const res = await fetch(`https://api.github.com/repos/${OWNER}/${repo}/contents/data/scorers.json`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${GH_TOKEN}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: '🥅 sync buteurs', content: Buffer.from(JSON.stringify(scorers, null, 2)).toString('base64'), ...(sha ? { sha } : {}) }),
        })
        if (!res.ok) throw new Error(`status ${res.status}`)
        log.push(`✅ ${repo} buteurs màj`)
      } catch (e) { log.push(`❌ ${repo} buteurs: ${e.message}`) }
    }

  } catch (e) {
    return NextResponse.json({ error: e.message, log }, { status: 500 })
  }

  return NextResponse.json({ ok: true, log })
}
