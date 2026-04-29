'use client'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  Tooltip, Legend, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { PLAYER_COLORS } from '../lib/colors'

const CHART_STYLE = {
  contentStyle: { background: '#ffffff', border: '1px solid #e4e4ec', borderRadius: 10, fontSize: 12, color: '#111118', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
  labelStyle: { color: '#aaaabc', fontSize: 11 },
  itemStyle: { color: '#111118' },
  cursor: { fill: 'rgba(0,0,0,0.02)' },
}

export function EvolutionChart({ data, joueurs }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4ec" />
        <XAxis dataKey="match" stroke="#e4e4ec" tick={{ fill: '#aaaabc', fontSize: 11 }} axisLine={false} />
        <YAxis stroke="#e4e4ec" tick={{ fill: '#aaaabc', fontSize: 11 }} axisLine={false} />
        <Tooltip {...CHART_STYLE} />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
        {joueurs.map((nom, i) => (
          <Line
            key={nom}
            type="monotone"
            dataKey={nom}
            stroke={PLAYER_COLORS[i % PLAYER_COLORS.length]}
            strokeWidth={2.5}
            dot={{ r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

export function ExactsChart({ data }) {
  const sorted = [...data].sort((a, b) => b.exacts - a.exacts)
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={sorted} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4ec" horizontal={false} />
        <XAxis type="number" stroke="#e4e4ec" tick={{ fill: '#aaaabc', fontSize: 11 }} axisLine={false} allowDecimals={false} />
        <YAxis dataKey="nom" type="category" stroke="#52525b" tick={{ fill: '#111118', fontSize: 12 }} width={65} />
        <Tooltip {...CHART_STYLE} formatter={v => [`${v} score(s) exact(s)`, '']} />
        <Bar dataKey="exacts" name="Scores exacts" radius={[0, 6, 6, 0]}>
          {sorted.map((_, i) => (
            <rect key={i} fill={`hsl(${142 - i * 12}, 70%, ${50 - i * 3}%)`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function PourcentagesChart({ data }) {
  const sorted = [...data].sort((a, b) => b.pourcentage - a.pourcentage)
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={sorted} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4ec" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} stroke="#e4e4ec" tick={{ fill: '#aaaabc', fontSize: 11 }} axisLine={false} />
        <YAxis dataKey="nom" type="category" stroke="#52525b" tick={{ fill: '#111118', fontSize: 12 }} width={65} />
        <Tooltip {...CHART_STYLE} formatter={v => [`${v}%`, 'Pronos corrects']} />
        <Bar dataKey="pourcentage" name="% corrects" fill="#3b82f6" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function PlacesChart({ premiere, derniere, joueurs }) {
  const data = joueurs.map(nom => ({
    nom,
    '1ère place': premiere[nom] ?? 0,
    'Dernière place': derniere[nom] ?? 0,
  })).sort((a, b) => b['1ère place'] - a['1ère place'])

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4ec" />
        <XAxis dataKey="nom" stroke="#52525b" tick={{ fill: '#e4e4e7', fontSize: 12 }} />
        <YAxis stroke="#e4e4ec" tick={{ fill: '#aaaabc', fontSize: 11 }} axisLine={false} allowDecimals={false} />
        <Tooltip {...CHART_STYLE} />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        <Bar dataKey="1ère place" fill="#eab308" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Dernière place" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
