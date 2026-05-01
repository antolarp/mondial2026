import { NextResponse } from 'next/server'

const OWNER    = process.env.GITHUB_OWNER || 'antolarp'
const REPO     = process.env.GITHUB_REPO  || 'mondial2026'
const FILE     = 'data/resultats.json'
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
  if (!res.ok) throw new Error('Impossible de lire resultats.json sur GitHub')
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

// ── POST : ajouter / modifier un résultat ────────────────────────────────────
export async function POST(request) {
  const { password, matchId, domicile, exterieur } = await request.json()

  if (!checkAuth(password))
    return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 })
  if (!process.env.GITHUB_TOKEN)
    return NextResponse.json({ error: 'GITHUB_TOKEN manquant dans les variables Vercel' }, { status: 500 })
  if (typeof domicile !== 'number' || typeof exterieur !== 'number' || domicile < 0 || exterieur < 0)
    return NextResponse.json({ error: 'Score invalide' }, { status: 400 })

  try {
    const { content, sha } = await getFile()
    content[matchId] = { domicile, exterieur }
    await putFile(content, sha, `⚽ score ${matchId} : ${domicile}-${exterieur}`)
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// ── DELETE : supprimer un résultat ───────────────────────────────────────────
export async function DELETE(request) {
  const { password, matchId } = await request.json()

  if (!checkAuth(password))
    return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 })
  if (!process.env.GITHUB_TOKEN)
    return NextResponse.json({ error: 'GITHUB_TOKEN manquant dans les variables Vercel' }, { status: 500 })

  try {
    const { content, sha } = await getFile()
    delete content[matchId]
    await putFile(content, sha, `🗑️ suppression résultat ${matchId}`)
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
