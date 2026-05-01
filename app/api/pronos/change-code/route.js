import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const OWNER = process.env.GITHUB_OWNER || 'antolarp'
const REPO  = process.env.GITHUB_REPO  || 'mondial2026'

async function ghGet(filePath) {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${filePath}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
      cache: 'no-store',
    }
  )
  if (!res.ok) throw new Error(`Impossible de lire ${filePath}`)
  const data = await res.json()
  return { content: JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8')), sha: data.sha }
}

async function ghPut(filePath, content, sha, message) {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${filePath}`,
    {
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
    }
  )
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Erreur GitHub API')
  }
}

export async function POST(request) {
  const { nom, currentCode, newCode } = await request.json()

  if (!nom || !currentCode || !newCode)
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
  if (!/^\d{4,8}$/.test(newCode))
    return NextResponse.json({ error: 'PIN invalide (4 à 8 chiffres)' }, { status: 400 })

  const filename = `data/joueurs/${nom.toLowerCase()}.json`

  // ── Mode local ───────────────────────────────────────────────
  if (!process.env.GITHUB_TOKEN) {
    try {
      const filePath = path.join(process.cwd(), filename)
      const joueur = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      if (joueur.code !== currentCode)
        return NextResponse.json({ error: 'Code actuel incorrect' }, { status: 401 })
      joueur.code = newCode
      fs.writeFileSync(filePath, JSON.stringify(joueur, null, 2))
      return NextResponse.json({ success: true })
    } catch (e) {
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  }

  // ── Mode production : GitHub API ─────────────────────────────
  try {
    const { content: joueur, sha } = await ghGet(filename)
    if (joueur.code !== currentCode)
      return NextResponse.json({ error: 'Code actuel incorrect' }, { status: 401 })
    joueur.code = newCode
    await ghPut(filename, joueur, sha, `🔑 changement de code — ${joueur.nom}`)
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
