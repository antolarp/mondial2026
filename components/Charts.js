'use client'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Cell, Legend,
} from 'recharts'
import { PLAYER_COLORS } from '../lib/colors'

const TOOLTIP = {
  contentStyle: {
    background: '#fff',
    border: '1px solid #e8eaf2',
    borderRadius: 12,
    fontSize: 13,
    color: '#0f172a',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    padding: '10px 14px',
  },
  labelStyle: { color: '#94a3b8', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', marginBottom: 4 },
  itemStyle: { color: '#0f172a', fontWeight: 600 },
  cursor: { fill: 'rgba(0,0,0,0.03)' },
}

// ── ÉVOLUTION (Area chart avec dégradés) ────────────────────────────────────
export function EvolutionChart({ data, joueurs }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          {joueurs.map((nom, i) => (
            <linearGradient key={nom} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PLAYER_COLORS[i % PLAYER_COLORS.length]} stopOpacity={0.25} />
              <stop offset="100%" stopColor={PLAYER_COLORS[i % PLAYER_COLORS.length]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid stroke="#f1f5f9" strokeDasharray="0" vertical={false} />
        <XAxis
          dataKey="match" stroke="none"
          tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
          axisLine={false} tickLine={false}
        />
        <YAxis
          stroke="none"
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          axisLine={false} tickLine={false}
        />
        <Tooltip {...TOOLTIP} />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 16, color: '#64748b' }}
          iconType="circle" iconSize={8}
        />
        {joueurs.map((nom, i) => (
          <Area
            key={nom}
            type="monotone"
            dataKey={nom}
            stroke={PLAYER_COLORS[i % PLAYER_COLORS.length]}
            strokeWidth={2.5}
            fill={`url(#grad-${i})`}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0, fill: PLAYER_COLORS[i % PLAYER_COLORS.length] }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ── SCORES EXACTS (barres colorées par joueur) ───────────────────────────────
export function ExactsChart({ data }) {
  const sorted = [...data].sort((a, b) => b.exacts - a.exacts)
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={sorted} layout="vertical" margin={{ top: 0, right: 24, left: 10, bottom: 0 }} barSize={14}>
        <CartesianGrid stroke="#f1f5f9" strokeDasharray="0" horizontal={false} />
        <XAxis
          type="number" stroke="none" allowDecimals={false}
          tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false}
        />
        <YAxis
          dataKey="nom" type="category" stroke="none"
          tick={{ fill: '#374151', fontSize: 13, fontWeight: 600 }}
          axisLine={false} tickLine={false} width={70}
        />
        <Tooltip {...TOOLTIP} formatter={(v) => [`${v} score${v > 1 ? 's' : ''} exact${v > 1 ? 's' : ''}`, '']} />
        <Bar dataKey="exacts" radius={[0, 8, 8, 0]}>
          {sorted.map((entry, i) => (
            <Cell key={i} fill={entry.color ?? PLAYER_COLORS[i % PLAYER_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── TAUX DE RÉUSSITE (barres colorées par joueur) ────────────────────────────
export function PourcentagesChart({ data }) {
  const sorted = [...data].sort((a, b) => b.pourcentage - a.pourcentage)
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={sorted} layout="vertical" margin={{ top: 0, right: 40, left: 10, bottom: 0 }} barSize={14}>
        <CartesianGrid stroke="#f1f5f9" strokeDasharray="0" horizontal={false} />
        <XAxis
          type="number" domain={[0, 100]} stroke="none"
          tickFormatter={v => `${v}%`}
          tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false}
        />
        <YAxis
          dataKey="nom" type="category" stroke="none"
          tick={{ fill: '#374151', fontSize: 13, fontWeight: 600 }}
          axisLine={false} tickLine={false} width={70}
        />
        <Tooltip {...TOOLTIP} formatter={(v) => [`${v}%`, 'Réussite']} />
        <Bar dataKey="pourcentage" radius={[0, 8, 8, 0]}>
          {sorted.map((entry, i) => (
            <Cell key={i} fill={entry.color ?? PLAYER_COLORS[i % PLAYER_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── PASSAGES EN TÊTE / LANTERNE ROUGE ────────────────────────────────────────
export function PlacesChart({ premiere, derniere, joueurs }) {
  const data = joueurs
    .map(nom => ({ nom, '1ère place': premiere[nom] ?? 0, 'Lanterne rouge': derniere[nom] ?? 0 }))
    .sort((a, b) => b['1ère place'] - a['1ère place'])

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 0, right: 10, left: -20, bottom: 0 }} barGap={3} barSize={14}>
        <CartesianGrid stroke="#f1f5f9" strokeDasharray="0" vertical={false} />
        <XAxis
          dataKey="nom" stroke="none"
          tick={{ fill: '#374151', fontSize: 12, fontWeight: 600 }}
          axisLine={false} tickLine={false}
        />
        <YAxis
          stroke="none" allowDecimals={false}
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          axisLine={false} tickLine={false}
        />
        <Tooltip {...TOOLTIP} />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 16, color: '#64748b' }}
          iconType="circle" iconSize={8}
        />
        <Bar dataKey="1ère place" fill="#f0b429" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Lanterne rouge" fill="#f43f5e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
