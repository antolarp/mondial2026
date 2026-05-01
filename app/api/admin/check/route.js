import { NextResponse } from 'next/server'

export async function POST(request) {
  const { password } = await request.json()
  const ok = password === (process.env.ADMIN_PASSWORD || 'mondial2026')
  return ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: 'Incorrect' }, { status: 401 })
}
