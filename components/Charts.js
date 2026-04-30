'use client'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Cell, Legend,
  LabelList, PieChart, Pie,
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

// ── ÉVOLUTION ────────────────────────────────────────────────────────────────
export function EvolutionChart({ data, joueurs }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          {joueurs.map((nom, i) => (
            <linearGradient key={nom} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PLAYER_COLORS[i % PLAYER_COLORS.length]} stopOpacity={0.2} />
              <stop offset="100%" stopColor={PLAYER_COLORS[i % PLAYER_COLORS.length]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="match" stroke="none" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis stroke="none" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip {...TOOLTIP} />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} iconType="circle" iconSize={8} />
        {joueurs.map((nom, i) => (
          <Area key={nom} type="monotone" dataKey={nom}
            stroke={PLAYER_COLORS[i % PLAYER_COLORS.length]} strokeWidth={2.5}
            fill={`url(#grad-${i})`} dot={false}
            activeDot={{ r: 5, strokeWidth: 0, fill: PLAYER_COLORS[i % PLAYER_COLORS.length] }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ── SCORES EXACTS — barres verticales ────────────────────────────────────────
export function ExactsChart({ data }) {
  const sorted = [...data].sort((a, b) => b.exacts - a.exacts)
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={sorted} margin={{ top: 28, right: 10, left: -20, bottom: 0 }} barSize={28}>
        <CartesianGrid stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="nom" stroke="none" tick={{ fill: '#374151', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
        <YAxis stroke="none" allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip {...TOOLTIP} formatter={v => [`${v} exact${v > 1 ? 's' : ''}`, '']} />
        <Bar dataKey="exacts" radius={[6, 6, 0, 0]}>
          <LabelList dataKey="exacts" position="top" style={{ fill: '#374151', fontSize: 13, fontWeight: 700 }} />
          {sorted.map((e, i) => <Cell key={i} fill={e.color ?? PLAYER_COLORS[i % PLAYER_COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── TAUX DE RÉUSSITE — barres verticales ─────────────────────────────────────
export function PourcentagesChart({ data }) {
  const sorted = [...data].sort((a, b) => b.pourcentage - a.pourcentage)
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={sorted} margin={{ top: 28, right: 10, left: -20, bottom: 0 }} barSize={28}>
        <CartesianGrid stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="nom" stroke="none" tick={{ fill: '#374151', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
        <YAxis stroke="none" domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip {...TOOLTIP} formatter={v => [`${v}%`, 'Réussite']} />
        <Bar dataKey="pourcentage" radius={[6, 6, 0, 0]}>
          <LabelList dataKey="pourcentage" position="top" formatter={v => `${v}%`} style={{ fill: '#374151', fontSize: 13, fontWeight: 700 }} />
          {sorted.map((e, i) => <Cell key={i} fill={e.color ?? PLAYER_COLORS[i % PLAYER_COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── CAMEMBERT générique ───────────────────────────────────────────────────────
const PIE_LABEL = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.06) return null
  const R = Math.PI / 180
  const r = innerRadius + (outerRadius - innerRadius) * 0.55
  return (
    <text x={cx + r * Math.cos(-midAngle * R)} y={cy + r * Math.sin(-midAngle * R)}
      fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={700}>
      {`${Math.round(percent * 100)}%`}
    </text>
  )
}

export function PlacesPieCharts({ premiere, derniere, joueurs, colors }) {
  const premData = joueurs.map((nom, i) => ({ name: nom, value: premiere[nom] ?? 0, color: colors[i] })).filter(d => d.value > 0)
  const dernData = joueurs.map((nom, i) => ({ name: nom, value: derniere[nom] ?? 0, color: colors[i] })).filter(d => d.value > 0)

  const renderLegend = (data) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', justifyContent: 'center', marginTop: 16 }}>
      {data.map(d => (
        <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>{d.name}</span>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>({d.value})</span>
        </div>
      ))}
    </div>
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <div>
        <p style={{ textAlign: 'center', fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 4 }}>Passages en tête</p>
        <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>Fois classé 1er après un match</p>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={premData} cx="50%" cy="50%" outerRadius={88} dataKey="value" labelLine={false} label={PIE_LABEL}>
              {premData.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Pie>
            <Tooltip contentStyle={TOOLTIP.contentStyle} formatter={(v, n) => [`${v} fois`, n]} />
          </PieChart>
        </ResponsiveContainer>
        {renderLegend(premData)}
      </div>
      <div>
        <p style={{ textAlign: 'center', fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 4 }}>Lanterne rouge</p>
        <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>Fois classé dernier après un match</p>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={dernData} cx="50%" cy="50%" outerRadius={88} dataKey="value" labelLine={false} label={PIE_LABEL}>
              {dernData.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Pie>
            <Tooltip contentStyle={TOOLTIP.contentStyle} formatter={(v, n) => [`${v} fois`, n]} />
          </PieChart>
        </ResponsiveContainer>
        {renderLegend(dernData)}
      </div>
    </div>
  )
}

// ── EFFICACITÉ — pts par match joué ─────────────────────────────────────────
export function EfficaciteChart({ data }) {
  const sorted = [...data].sort((a, b) => b.ppm - a.ppm)
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={sorted} margin={{ top: 28, right: 10, left: -20, bottom: 0 }} barSize={28}>
        <CartesianGrid stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="nom" stroke="none" tick={{ fill: '#374151', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
        <YAxis stroke="none" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip {...TOOLTIP} formatter={v => [`${v} pts/match`, '']} />
        <Bar dataKey="ppm" radius={[6, 6, 0, 0]}>
          <LabelList dataKey="ppm" position="top" style={{ fill: '#374151', fontSize: 13, fontWeight: 700 }} />
          {sorted.map((e, i) => <Cell key={i} fill={e.color ?? PLAYER_COLORS[i % PLAYER_COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
