"use client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { theme } from "@/lib/theme"

interface ServiceRequestDataPoint {
  date: string
  contact_us: number
  enquire_now: number
}

interface ServiceRequestChartProps {
  data: ServiceRequestDataPoint[]
}

export default function ServiceRequestChart({ data }: ServiceRequestChartProps) {
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
            Requests over time
          </div>
          <div style={{ fontSize: 12, color: theme.colors.neutral.muted, marginTop: 2 }}>
            contact_us vs enquire_now
          </div>
        </div>
      </div>

      {/* Custom legend */}
      <div style={{ display: "flex", gap: 16, marginBottom: 12, fontSize: 12, color: theme.colors.neutral.muted }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: theme.chart.pink, display: "inline-block" }} />
          Contact us
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: theme.chart.purple, display: "inline-block" }} />
          Enquire now
        </span>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.neutral.border} vertical={false} />
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
          <Bar dataKey="contact_us" stackId="a" fill={theme.chart.pink} radius={[0, 0, 0, 0]} />
          <Bar dataKey="enquire_now" stackId="a" fill={theme.chart.purple} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}