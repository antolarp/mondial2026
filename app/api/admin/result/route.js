import { NextResponse } from 'next/server'

const OWNER    = process.env.GITHUB_OWNER || 'antolarp'
const REPO     = process.env.GITHUB_REPO  || 'mondial2026'
const FILE     = 'data/resultats.json'
const API_BASE = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}`
const MATCHS_API = `https://api.github.com/repos/${OWNER}/${REPO}/contents/data/matchs.json`

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

    // Avancer le vainqueur dans le bracket
    const bracket = BRACKET_MAP[matchId]
    if (bracket) {
      const winner = domicile > exterieur ? '_dom' : '_ext'
      // Lire matchs.json pour connaître les noms des équipes
      const mRes = await fetch(MATCHS_API, {
        headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' },
        cache: 'no-store',
      })
      if (mRes.ok) {
        const mData = await mRes.json()
        const matchs = JSON.parse(Buffer.from(mData.content, 'base64').toString('utf-8'))
        const r32Match = matchs.find(m => m.id === matchId)
        if (r32Match) {
          const winnerNom = domicile > exterieur ? r32Match.domicile : r32Match.exterieur
          const r16Match = matchs.find(m => m.id === bracket.r16)
          if (r16Match) {
            r16Match[bracket.pos] = winnerNom
            await fetch(MATCHS_API, {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                message: `🏆 ${matchId} → ${bracket.r16} ${bracket.pos}: ${winnerNom}`,
                content: Buffer.from(JSON.stringify(matchs, null, 2)).toString('base64'),
                sha: mData.sha,
              }),
            })
          }
        }
      }
    }

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
