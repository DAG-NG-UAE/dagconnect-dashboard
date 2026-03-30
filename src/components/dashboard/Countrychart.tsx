"use client"
import { theme } from "@/lib/theme"

interface CountryItem {
  country: string
  acquisitions: number
}

interface CountryChartProps {
  data: CountryItem[]
}

const barColors = [
  theme.chart.pink,
  theme.chart.purple,
  theme.chart.peach,
  theme.chart.rose,
]

export default function CountryChart({ data }: CountryChartProps) {
  const max = Math.max(...data.map((d) => d.acquisitions))

  return (
    <div style={{
      background: theme.colors.neutral.surface,
      border: `1px solid ${theme.colors.neutral.border}`,
      borderRadius: theme.radius.lg,
      padding: "18px 20px",
    }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontFamily: theme.fonts.display, color: theme.colors.neutral.text }}>
          By country
        </div>
        <div style={{ fontSize: 12, color: theme.colors.neutral.muted, marginTop: 2 }}>
          Top regions
        </div>
      </div>

      {data.map((item, i) => (
        <div key={item.country} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div style={{
            fontSize: 12, color: theme.colors.neutral.muted,
            width: 90, flexShrink: 0,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {item.country}
          </div>
          <div style={{
            flex: 1, height: 8,
            background: theme.colors.pink[50],
            borderRadius: 4, overflow: "hidden",
          }}>
            <div style={{
              width: `${(item.acquisitions / max) * 100}%`,
              height: "100%",
              background: barColors[i % barColors.length],
              borderRadius: 4,
              transition: "width 0.6s ease",
            }} />
          </div>
          <div style={{
            fontSize: 12, fontWeight: 500,
            color: theme.colors.neutral.text,
            width: 36, textAlign: "right", flexShrink: 0,
          }}>
            {item.acquisitions}
          </div>
        </div>
      ))}

      {/* Other footnote */}
      <div style={{
        marginTop: 12, fontSize: 10.5, color: theme.colors.neutral.muted,
        borderTop: `1px dashed ${theme.colors.neutral.border}`,
        paddingTop: 8, lineHeight: 1.5,
      }}>
        <strong>* "Other"</strong> is a catch-all category returned by Google Play Console and is not broken down by specific country or region.
      </div>
    </div>
  )
}