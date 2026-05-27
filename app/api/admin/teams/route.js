import { NextResponse } from 'next/server'

const OWNER    = process.env.GITHUB_OWNER || 'antolarp'
const REPO     = process.env.GITHUB_REPO  || 'mondial2026'
const FILE     = 'data/matchs.json'
const API_BASE = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}`

function checkAuth(password) {
  return password === (process.env.ADMIN_PASSWORD || 'mondial2026')
}

async function getFile() {
  const res = await fetch(API_BASE, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
    },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Impossible de lire matchs.json sur GitHub')
  const data = await res.json()
  const content = JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'))
  return { content, sha: data.sha }
}

async function putFile(content, sha, message) {
  const res = await fetch(API_BASE, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
      sha,
    }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Erreur GitHub API')
  }
}

// POST : mettre à jour les équipes d'un match
export async function POST(request) {
  const { password, matchId, domicile, exterieur } = await request.json()

  if (!checkAuth(password))
    return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 })
  if (!process.env.GITHUB_TOKEN)
    return NextResponse.json({ error: 'GITHUB_TOKEN manquant' }, { status: 500 })
  if (!domicile || !exterieur)
    return NextResponse.json({ error: 'Équipes invalides' }, { status: 400 })

  try {
    const { content, sha } = await getFile()
    const idx = content.findIndex(m => m.id === matchId)
    if (idx === -1) throw new Error('Match introuvable')
    content[idx] = { ...content[idx], domicile, exterieur }
    await putFile(content, sha, `🏟️ équipes ${matchId} : ${domicile} vs ${exterieur}`)
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
