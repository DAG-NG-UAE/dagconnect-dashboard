"use client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { theme } from "@/lib/theme"

interface PurchaseDataPoint {
  date: string
  items: number
  vehicles: number
}

interface PurchaseChartProps {
  data: PurchaseDataPoint[]
}

export default function PurchaseChart({ data }: PurchaseChartProps) {
  return (
    <div style={{
      background: theme.colors.neutral.surface,
      border: `1px solid ${theme.colors.neutral.border}`,
      borderRadius: theme.radius.lg,
      padding: "18px 20px",
    }}>
      {/* Unverified warning */}
      <div style={{
        background: theme.colors.warning.bg,
        border: `1px solid ${theme.colors.warning.border}`,
        borderRadius: theme.radius.sm,
        padding: "8px 12px",
        fontSize: 11,
        color: theme.colors.warning.text,
        marginBottom: 16,
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}>
        ⚠ This data is user-entered and completely unverified. Treat as directional only — do not use for financial decisions.
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 15, fontFamily: theme.fonts.display, color: theme.colors.neutral.text }}>
            Reported purchases
          </div>
          <div style={{ fontSize: 12, color: theme.colors.neutral.muted, marginTop: 2 }}>
            Self-reported by users · items + vehicles
          </div>
        </div>
      </div>

      {/* Custom legend */}
      <div style={{ display: "flex", gap: 16, marginBottom: 12, fontSize: 12, color: theme.colors.neutral.muted }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: theme.chart.pink, display: "inline-block" }} />
          Items
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: theme.chart.peach, display: "inline-block" }} />
          Vehicles
        </span>
      </div>

      <ResponsiveContainer width="100%" height={160}>
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
          <Bar dataKey="items" fill={theme.chart.pink} radius={[4, 4, 0, 0]} />
          <Bar dataKey="vehicles" fill={theme.chart.peach} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div style={{ fontSize: 11, color: theme.colors.neutral.muted, marginTop: 8, fontStyle: "italic" }}>
        * Users enter their own purchase history. There is no way to verify this data against actual transactions.
      </div>
    </div>
  )
}