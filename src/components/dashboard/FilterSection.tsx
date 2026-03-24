"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { theme } from "@/lib/theme"

interface FilterSectionProps {
  years: number[]
  months: number[]
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

export default function FilterSection({ years, months }: FilterSectionProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentMonth = searchParams.get("month") || ""
  const currentYear = searchParams.get("year") || ""

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/?${params.toString()}`)
  }

  const selectStyle = {
    padding: "8px 12px",
    borderRadius: theme.radius.sm,
    border: `1px solid ${theme.colors.neutral.border}`,
    background: theme.colors.neutral.surface,
    color: theme.colors.neutral.text,
    fontSize: 14,
    fontFamily: theme.fonts.body,
    cursor: "pointer",
    outline: "none",
  }

  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "center" }}>
      <span style={{ fontSize: 13, color: theme.colors.neutral.muted, fontWeight: 500 }}>Filter by:</span>
      
      <select 
        value={currentMonth} 
        onChange={(e) => updateFilters("month", e.target.value)}
        style={selectStyle}
      >
        <option value="">All months</option>
        {months.map(m => (
          <option key={m} value={m}>{MONTH_NAMES[m-1]}</option>
        ))}
      </select>

      <select 
        value={currentYear} 
        onChange={(e) => updateFilters("year", e.target.value)}
        style={selectStyle}
      >
        <option value="">All years</option>
        {years.map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      {(currentMonth || currentYear) && (
        <button 
          onClick={() => router.push("/")}
          style={{
            background: "none",
            border: "none",
            color: theme.colors.pink[600],
            fontSize: 13,
            cursor: "pointer",
            padding: "4px 8px",
          }}
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
