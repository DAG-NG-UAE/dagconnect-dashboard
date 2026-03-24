"use client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { theme } from "@/lib/theme"

interface RegistrationDataPoint {
  date: string
  count: number
}

interface RegistrationChartProps {
  data: RegistrationDataPoint[]
}

export default function RegistrationChart({ data }: RegistrationChartProps) {
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
            Daily registrations
          </div>
          <div style={{ fontSize: 12, color: theme.colors.neutral.muted, marginTop: 2 }}>
            New accounts created per day
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
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
          <Bar dataKey="count" fill={theme.chart.purple} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
