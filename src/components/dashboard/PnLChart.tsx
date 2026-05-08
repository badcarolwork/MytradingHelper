'use client'

import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer,
  Tooltip, ReferenceLine,
} from 'recharts'
import type { PnLRecord } from '@/types'

export function PnLChart({ data }: { data: PnLRecord[] }) {
  if (!data.length) {
    return <div className="h-[100px] flex items-center justify-center text-slate-500 text-sm">Loading chart…</div>
  }

  const hasNeg = data.some(d => d.daily_pnl < 0)

  return (
    <div className="h-[100px] -mx-1">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
          <defs>
            <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fill: '#475569', fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}
            tickFormatter={(v: string) => v.slice(5)}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis hide />
          {hasNeg && (
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
          )}
          <Tooltip
            contentStyle={{
              background: '#1e2d45',
              border: '1px solid rgba(99,160,255,0.15)',
              borderRadius: 8,
              fontSize: 11,
              fontFamily: 'JetBrains Mono, monospace',
              color: '#e2e8f0',
            }}
            formatter={(v) => [`RM ${Number(v ?? 0).toFixed(0)}`, 'P&L']}
            labelFormatter={(l) => String(l ?? "")}
          />
          <Area
            type="monotone"
            dataKey="cumulative_pnl"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#pnlGrad)"
            dot={{ fill: '#34d399', r: 2.5, strokeWidth: 0 }}
            activeDot={{ r: 4, fill: '#34d399' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
