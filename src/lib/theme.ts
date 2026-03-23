export const theme = {
  colors: {
    pink: {
      50:  "#fdf0f5",
      100: "#f7c9dc",
      200: "#ed93b1",
      400: "#e06fa0",
      600: "#b84d7d",
      800: "#7a2a50",
    },
    purple: {
      50:  "#f3f0fd",
      100: "#d9d0f7",
      200: "#afa9ec",
      400: "#9b87e8",
      600: "#6b54cc",
      800: "#3e2e8a",
    },
    peach: {
      50:  "#fff5f0",
      100: "#ffd8c0",
      400: "#f0a070",
      600: "#c05020",
    },
    rose: {
      50:  "#fff0f3",
      400: "#e07090",
      600: "#b03060",
    },
    success: {
      bg:   "#edf7ee",
      text: "#2d7a3a",
    },
    warning: {
      bg:   "#fff8e6",
      border: "#f0d080",
      text: "#8a6010",
    },
    danger: {
      bg:   "#fdecea",
      text: "#b03030",
    },
    neutral: {
      bg:     "#fdf8fc",
      surface: "#ffffff",
      border:  "#eddbe8",
      muted:   "#8a7a92",
      text:    "#2a1a2e",
    },
  },

  // Recharts-friendly flat color list (no CSS vars — recharts can't resolve them)
  chart: {
    pink:   "#e06fa0",
    purple: "#9b87e8",
    peach:  "#f0a070",
    rose:   "#d4a0c8",
    pinkFill:   "#e06fa022",
    purpleFill: "#9b87e822",
  },

  fonts: {
    display: "var(--font-dm-serif-display), serif",
    body:    "var(--font-dm-sans), sans-serif",
  },

  radius: {
    sm:  "8px",
    md:  "12px",
    lg:  "16px",
    full: "9999px",
  },

  // Reusable card style object for inline styles or sx props
  card: {
    background: "#ffffff",
    border: "1px solid #eddbe8",
    borderRadius: "16px",
    padding: "18px 20px",
  },
} as const

// KPI card accent configs — import and map by index
export const kpiAccents = [
  { icon: "↓", color: theme.colors.pink,   label: "pink"   },
  { icon: "☺", color: theme.colors.purple, label: "purple" },
  { icon: "✉", color: theme.colors.peach,  label: "peach"  },
  { icon: "◆", color: theme.colors.rose,   label: "rose"   },
] as const

export type ThemeColor = keyof typeof theme.colors