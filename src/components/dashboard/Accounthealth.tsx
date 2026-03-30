"use client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { theme } from "@/lib/theme"

interface AccountHealthProps {
  active: number
  inactive: number
  expired: number
}

export default function AccountHealth({ active, inactive, expired }: AccountHealthProps) {
  const barData = [
    { label: "Active",   value: active,   color: theme.chart.pink   },
    { label: "Inactive", value: inactive, color: theme.chart.purple  },
    { label: "Expired",  value: expired,  color: theme.chart.peach   },
  ]

  return (
    <div style={{
      background: theme.colors.neutral.surface,
      border: `1px solid ${theme.colors.neutral.border}`,
      borderRadius: theme.radius.lg,
      padding: "18px 20px",
    }}>
      <div style={{
        fontSize: 15, fontFamily: theme.fonts.display,
        color: theme.colors.neutral.text, marginBottom: 16,
      }}>
        Account health
      </div>

      {/* Summary counters */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 16 }}>
        {barData.map((item) => (
          <div key={item.label} style={{
            background: theme.colors.neutral.bg,
            borderRadius: 10, padding: "12px 8px", textAlign: "center",
          }}>
            <div style={{
              fontSize: 20, fontFamily: theme.fonts.display,
              color: item.color, lineHeight: 1,
            }}>
              {item.value.toLocaleString()}
            </div>
            <div style={{ fontSize: 11, color: theme.colors.neutral.muted, marginTop: 4 }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* Status legend */}
      <div style={{
        background: theme.colors.neutral.bg,
        borderRadius: 8, padding: "10px 12px", marginBottom: 16,
        fontSize: 11, color: theme.colors.neutral.muted, lineHeight: 1.8,
      }}>
        <div style={{ display: "flex", gap: 6, alignItems: "baseline" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: theme.chart.pink, display: "inline-block", flexShrink: 0, marginTop: 3 }} />
          <span><strong style={{ color: theme.chart.pink }}>Active</strong> — successfully received OTP and logs in frequently.</span>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "baseline" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: theme.chart.purple, display: "inline-block", flexShrink: 0, marginTop: 3 }} />
          <span><strong style={{ color: theme.chart.purple }}>Inactive</strong> — default status for a newly registered account that has not yet logged in.</span>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "baseline" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: theme.chart.peach, display: "inline-block", flexShrink: 0, marginTop: 3 }} />
          <span><strong style={{ color: theme.chart.peach }}>Expired</strong> — session token has expired and the user has not logged back in yet.</span>
        </div>
      </div>

      {/* Bar chart */}
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={barData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.neutral.border} vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: theme.colors.neutral.muted }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: theme.colors.neutral.muted }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              background: theme.colors.neutral.surface,
              border: `1px solid ${theme.colors.neutral.border}`,
              borderRadius: theme.radius.md,
              fontSize: 12,
            }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {barData.map((item, i) => (
              <Cell key={i} fill={item.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}