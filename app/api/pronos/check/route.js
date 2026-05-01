import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const OWNER = process.env.GITHUB_OWNER || 'antolarp'
const REPO  = process.env.GITHUB_REPO  || 'mondial2026'

export async function POST(request) {
  const { nom, code } = await request.json()
  if (!nom || !code)
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })

  // ── Mode local (pas de GITHUB_TOKEN) : lecture filesystem ───────
  if (!process.env.GITHUB_TOKEN) {
    try {
      const filePath = path.join(process.cwd(), 'data', 'joueurs', `${nom.toLowerCase()}.json`)
      const joueur = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      if (joueur.code !== code)
        return NextResponse.json({ error: 'Code incorrect' }, { status: 401 })
      return NextResponse.json({ success: true })
    } catch {
      return NextResponse.json({ error: 'Joueur introuvable' }, { status: 404 })
    }
  }

  // ── Mode production : lecture GitHub ────────────────────────────
  try {
    const filename = `${nom.toLowerCase()}.json`
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/data/joueurs/${filename}`
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
      cache: 'no-store',
    })
    if (!res.ok) return NextResponse.json({ error: 'Joueur introuvable' }, { status: 404 })
    const data = await res.json()
    const joueur = JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'))

    if (joueur.code !== code)
      return NextResponse.json({ error: 'Code incorrect' }, { status: 401 })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
