"use client"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { theme } from "@/lib/theme"

interface DonutItem {
  label: string
  value: number
}

interface DonutChartProps {
  title: string
  data: DonutItem[]
  centerLabel: string
  centerSub: string
  colors?: string[]
}

const DEFAULT_COLORS = [theme.chart.pink, theme.chart.purple, theme.chart.peach, theme.chart.rose]

function DonutChart({ title, data, centerLabel, centerSub, colors = DEFAULT_COLORS }: DonutChartProps) {
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
        {title}
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        {/* Donut with center label */}
        <div style={{ position: "relative", width: 130, height: 130 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={60}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: theme.colors.neutral.surface,
                  border: `1px solid ${theme.colors.neutral.border}`,
                  borderRadius: theme.radius.md,
                  fontSize: 12,
                }}
                formatter={(value: any) => [`${value}%`, ""]}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center", pointerEvents: "none",
          }}>
            <div style={{ fontSize: 18, fontFamily: theme.fonts.display, color: theme.colors.neutral.text, lineHeight: 1 }}>
              {centerLabel}
            </div>
            <div style={{ fontSize: 10, color: theme.colors.neutral.muted, marginTop: 2 }}>
              {centerSub}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
          {data.map((item, i) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: theme.colors.neutral.muted }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors[i % colors.length], flexShrink: 0 }} />
                {item.label}
              </div>
              <div style={{ fontWeight: 500, color: theme.colors.neutral.text }}>{item.value}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface PlatformDonutProps {
  data: DonutItem[]
}

export function PlatformDonut({ data }: PlatformDonutProps) {
  const top = data[0]
  return (
    <DonutChart
      title="Platform split"
      data={data}
      centerLabel={`${top?.value ?? 0}%`}
      centerSub={top?.label ?? ""}
    />
  )
}

interface CategoryDonutProps {
  data: DonutItem[]
  totalUsers: number
}

export function CategoryDonut({ data, totalUsers }: CategoryDonutProps) {
  return (
    <DonutChart
      title="User category"
      data={data}
      centerLabel={totalUsers.toLocaleString()}
      centerSub="total"
    />
  )
}