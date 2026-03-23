import { theme } from "@/lib/theme"

interface KpiCardProps {
  label: string
  value: string | number
  sub: string
  delta?: string
  deltaType?: "up" | "down" | "neutral"
  accent: "pink" | "purple" | "peach" | "rose"
  icon: string
}

const accentMap = {
  pink:   { icon: theme.colors.pink[50],   iconText: theme.colors.pink[600],   border: theme.colors.pink[400]   },
  purple: { icon: theme.colors.purple[50], iconText: theme.colors.purple[600], border: theme.colors.purple[400] },
  peach:  { icon: theme.colors.peach[50],  iconText: theme.colors.peach[600],  border: theme.colors.peach[400]  },
  rose:   { icon: theme.colors.rose[50],   iconText: theme.colors.rose[600],   border: theme.colors.rose[400]   },
}

const deltaStyles = {
  up:      { background: theme.colors.success.bg,  color: theme.colors.success.text },
  down:    { background: theme.colors.danger.bg,   color: theme.colors.danger.text  },
  neutral: { background: theme.colors.purple[50],  color: theme.colors.purple[600]  },
}

export default function KpiCard({ label, value, sub, delta, deltaType = "neutral", accent, icon }: KpiCardProps) {
  const a = accentMap[accent]

  return (
    <div style={{
      background: theme.colors.neutral.surface,
      border: `1px solid ${theme.colors.neutral.border}`,
      borderRadius: theme.radius.lg,
      padding: "16px 18px",
      position: "relative",
      overflow: "hidden",
      fontFamily: theme.fonts.body,
    }}>
      {/* Accent blob top-right */}
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: 60, height: 60,
        borderRadius: "0 16px 0 60px",
        background: a.border,
        opacity: 0.08,
      }} />

      {/* Icon */}
      <div style={{
        width: 32, height: 32, borderRadius: theme.radius.sm,
        background: a.icon, color: a.iconText,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, marginBottom: 10,
      }}>
        {icon}
      </div>

      <div style={{ fontSize: 11, color: theme.colors.neutral.muted, marginBottom: 4 }}>{label}</div>

      <div style={{
        fontSize: 26,
        fontFamily: theme.fonts.display,
        color: theme.colors.neutral.text,
        lineHeight: 1,
      }}>
        {value}
      </div>

      <div style={{ fontSize: 11, color: theme.colors.neutral.muted, marginTop: 6 }}>{sub}</div>

      {delta && (
        <span style={{
          ...deltaStyles[deltaType],
          fontSize: 11, fontWeight: 500,
          padding: "2px 7px", borderRadius: 10,
          display: "inline-block", marginTop: 6,
        }}>
          {delta}
        </span>
      )}
    </div>
  )
}