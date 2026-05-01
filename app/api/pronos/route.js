import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { computePronoPhases } from '../../../lib/phases'

const OWNER = process.env.GITHUB_OWNER || 'antolarp'
const REPO  = process.env.GITHUB_REPO  || 'mondial2026'

// ── Helpers GitHub API ────────────────────────────────────────────
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

// ── POST : sauvegarder les pronos d'une phase ─────────────────────
export async function POST(request) {
  const { nom, code, pronos, matchIds } = await request.json()

  if (!nom || !code || !pronos || !matchIds)
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })

  const filename = `data/joueurs/${nom.toLowerCase()}.json`

  // ── Mode local (pas de GITHUB_TOKEN) ────────────────────────────
  if (!process.env.GITHUB_TOKEN) {
    try {
      const filePath = path.join(process.cwd(), filename)
      const joueur = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

      if (joueur.code !== code)
        return NextResponse.json({ error: 'Code incorrect' }, { status: 401 })

      // Vérifier deadline
      const matchs = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'matchs.json'), 'utf-8'))
      const phases = computePronoPhases(matchs)
      const phaseMatchIds = new Set(matchIds)
      const phase = phases.find(p => p.matchs.some(m => phaseMatchIds.has(m.id)))
      if (!phase || !phase.isOpen)
        return NextResponse.json({ error: 'Phase verrouillée — délai dépassé' }, { status: 403 })

      const updated = { ...joueur, pronos: { ...joueur.pronos, ...pronos } }
      fs.writeFileSync(filePath, JSON.stringify(updated, null, 2))
      return NextResponse.json({ success: true })
    } catch (e) {
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  }

  // ── Mode production : GitHub API ─────────────────────────────────
  try {
    const { content: joueur, sha } = await ghGet(filename)

    if (joueur.code !== code)
      return NextResponse.json({ error: 'Code incorrect' }, { status: 401 })

    // Charger matchs depuis GitHub pour vérifier deadline
    const { content: matchs } = await ghGet('data/matchs.json')
    const phases = computePronoPhases(matchs)
    const phaseMatchIds = new Set(matchIds)
    const phase = phases.find(p => p.matchs.some(m => phaseMatchIds.has(m.id)))

    if (!phase || !phase.isOpen)
      return NextResponse.json({ error: 'Phase verrouillée — délai dépassé' }, { status: 403 })

    const updated = { ...joueur, pronos: { ...joueur.pronos, ...pronos } }
    await ghPut(filename, updated, sha, `🎯 pronos ${joueur.nom} — ${phase.label}`)
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
