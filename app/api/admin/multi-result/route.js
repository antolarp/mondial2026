import { NextResponse } from 'next/server'

const OWNER = process.env.GITHUB_OWNER || 'antolarp'
const FILE  = 'data/resultats.json'
const TOKEN = process.env.GITHUB_TOKEN

// Seizième → quelle position dans quel huitième
const BRACKET_MAP = {
  'M74': { r16: 'M89', pos: 'domicile' },
  'M77': { r16: 'M89', pos: 'exterieur' },
  'M73': { r16: 'M90', pos: 'domicile' },
  'M75': { r16: 'M90', pos: 'exterieur' },
  'M83': { r16: 'M91', pos: 'domicile' },
  'M84': { r16: 'M91', pos: 'exterieur' },
  'M81': { r16: 'M92', pos: 'domicile' },
  'M82': { r16: 'M92', pos: 'exterieur' },
  'M76': { r16: 'M93', pos: 'domicile' },
  'M78': { r16: 'M93', pos: 'exterieur' },
  'M79': { r16: 'M94', pos: 'domicile' },
  'M80': { r16: 'M94', pos: 'exterieur' },
  'M86': { r16: 'M95', pos: 'domicile' },
  'M88': { r16: 'M95', pos: 'exterieur' },
  'M85': { r16: 'M96', pos: 'domicile' },
  'M87': { r16: 'M96', pos: 'exterieur' },
}

function checkAuth(password) {
  return password === (process.env.ADMIN_PASSWORD || 'mondial2026')
}

function getRepos() {
  const all = process.env.GITHUB_REPOS_ALL
  if (all) return all.split(',').map(r => r.trim()).filter(Boolean)
  return [process.env.GITHUB_REPO || 'mondial2026']
}

async function getFile(repo) {
  const url = `https://api.github.com/repos/${OWNER}/${repo}/contents/${FILE}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/vnd.github.v3+json' },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Impossible de lire ${repo}`)
  const data = await res.json()
  return { content: JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8')), sha: data.sha }
}

async function putFile(repo, content, sha, message) {
  const url = `https://api.github.com/repos/${OWNER}/${repo}/contents/${FILE}`
  const res = await fetch(url, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'), sha }),
  })
  if (!res.ok) { const err = await res.json(); throw new Error(`${repo}: ${err.message}`) }
}

async function advanceBracket(repo, matchId, domicile, exterieur) {
  const bracket = BRACKET_MAP[matchId]
  if (!bracket) return
  const matchsUrl = `https://api.github.com/repos/${OWNER}/${repo}/contents/data/matchs.json`
  const mRes = await fetch(matchsUrl, {
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/vnd.github.v3+json' },
    cache: 'no-store',
  })
  if (!mRes.ok) return
  const mData = await mRes.json()
  const matchs = JSON.parse(Buffer.from(mData.content, 'base64').toString('utf-8'))
  const r32Match = matchs.find(m => m.id === matchId)
  const r16Match = matchs.find(m => m.id === bracket.r16)
  if (!r32Match || !r16Match) return
  const winnerNom = domicile > exterieur ? r32Match.domicile : r32Match.exterieur
  r16Match[bracket.pos] = winnerNom
  await fetch(matchsUrl, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: `🏆 ${matchId} → ${bracket.r16} ${bracket.pos}: ${winnerNom}`,
      content: Buffer.from(JSON.stringify(matchs, null, 2)).toString('base64'),
      sha: mData.sha,
    }),
  })
}

async function applyToRepo(repo, matchId, score) {
  const { content, sha } = await getFile(repo)
  if (score === null) delete content[matchId]
  else content[matchId] = score
  const msg = score ? `⚽ score ${matchId} : ${score.domicile}-${score.exterieur}` : `🗑️ suppression résultat ${matchId}`
  await putFile(repo, content, sha, msg)
  if (score) await advanceBracket(repo, matchId, score.domicile, score.exterieur)
  return { repo, ok: true }
}

export async function POST(request) {
  const { password, matchId, domicile, exterieur } = await request.json()
  if (!checkAuth(password)) return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 })
  if (!TOKEN) return NextResponse.json({ error: 'GITHUB_TOKEN manquant' }, { status: 500 })
  if (typeof domicile !== 'number' || typeof exterieur !== 'number' || domicile < 0 || exterieur < 0)
    return NextResponse.json({ error: 'Score invalide' }, { status: 400 })

  const repos = getRepos()
  const results = await Promise.allSettled(repos.map(r => applyToRepo(r, matchId, { domicile, exterieur })))
  const errors = results.filter(r => r.status === 'rejected').map(r => r.reason?.message)
  if (errors.length) return NextResponse.json({ error: errors.join(' | ') }, { status: 500 })
  return NextResponse.json({ success: true, repos })
}

export async function DELETE(request) {
  const { password, matchId } = await request.json()
  if (!checkAuth(password)) return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 })
  if (!TOKEN) return NextResponse.json({ error: 'GITHUB_TOKEN manquant' }, { status: 500 })

  const repos = getRepos()
  const results = await Promise.allSettled(repos.map(r => applyToRepo(r, matchId, null)))
  const errors = results.filter(r => r.status === 'rejected').map(r => r.reason?.message)
  if (errors.length) return NextResponse.json({ error: errors.join(' | ') }, { status: 500 })
  return NextResponse.json({ success: true, repos })
}
