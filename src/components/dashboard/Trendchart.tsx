"use client"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { theme } from "@/lib/theme"

interface TrendDataPoint {
  date: string
  visitors: number
  acquisitions: number
}

interface TrendChartProps {
  data: TrendDataPoint[]
}

export default function TrendChart({ data }: TrendChartProps) {
  return (
    <div style={{
      background: theme.colors.neutral.surface,
      border: `1px solid ${theme.colors.neutral.border}`,
      borderRadius: theme.radius.lg,
      padding: "18px 20px",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 15, fontFamily: theme.fonts.display, color: theme.colors.neutral.text }}>
            Store visitors vs acquisitions
          </div>
          <div style={{ fontSize: 12, color: theme.colors.neutral.muted, marginTop: 2 }}>
            Daily store listing performance
          </div>
        </div>
        <span style={{
          fontSize: 11, padding: "3px 10px", borderRadius: 10,
          background: theme.colors.pink[50], color: theme.colors.pink[600],
          border: `1px solid ${theme.colors.neutral.border}`,
        }}>
          Last 30 days
        </span>
      </div>

      {/* Custom legend */}
      <div style={{ display: "flex", gap: 16, marginBottom: 12, fontSize: 12, color: theme.colors.neutral.muted }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: theme.chart.pink, display: "inline-block" }} />
          Visitors
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: theme.chart.purple, display: "inline-block" }} />
          Acquisitions
        </span>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.neutral.border} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: theme.colors.neutral.muted }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: theme.colors.neutral.muted }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              background: theme.colors.neutral.surface,
              border: `1px solid ${theme.colors.neutral.border}`,
              borderRadius: theme.radius.md,
              fontSize: 12,
            }}
          />
          <Line type="monotone" dataKey="visitors" stroke={theme.chart.pink} strokeWidth={2} dot={{ r: 3, fill: theme.chart.pink }} fill={theme.chart.pinkFill} />
          <Line type="monotone" dataKey="acquisitions" stroke={theme.chart.purple} strokeWidth={2} dot={{ r: 3, fill: theme.chart.purple }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}