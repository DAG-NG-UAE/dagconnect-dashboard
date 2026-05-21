"use client"
import { useState, useMemo, useRef, useCallback } from "react"
import { theme } from "@/lib/theme"

interface CustomerRow {
  customer_since: string
  loginid: string
  fullname: string | null
  fullphonenumber: string | null
  email: string | null
  permanentaddress: string | null
}

const PER_PAGE = 20

const NIN_ROASTS = [
  "Did you not know NIN is confidential?",
  "You fell for it again. You cannot see confidential information.",
  "Please meet the CDO for data literacy training.",
  "Nice try. This is not that kind of dashboard.",
  "Bold of you to click. IT has been notified.",
  "The NIN stays hidden. Always. Forever. Goodbye.",
  "This is classified. Even we look away.",
  "Please close your eyes and scroll away.",
  "Confidential means confidential. Try the exit button.",
  "Access denied. Have you tried showing interest in the data literacy training?",
]

function pickRoast(): string {
  return NIN_ROASTS[Math.floor(Math.random() * NIN_ROASTS.length)]
}

function formatAddress(raw: string | null): string {
  if (!raw) return "—"
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw
    return [parsed.street, parsed.city, parsed.state, parsed.country]
      .filter(Boolean)
      .join(", ") || raw
  } catch {
    return raw
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function Tooltip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  return (
    <span
      ref={ref}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      style={{ position: "relative", display: "inline-block", marginLeft: 6, cursor: "default" }}
    >
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 15,
        height: 15,
        borderRadius: "50%",
        background: theme.colors.purple[100],
        color: theme.colors.purple[600],
        fontSize: 10,
        fontWeight: 700,
        lineHeight: 1,
        userSelect: "none",
      }}>
        i
      </span>
      {visible && (
        <span style={{
          position: "absolute",
          bottom: "calc(100% + 8px)",
          left: "50%",
          transform: "translateX(-50%)",
          background: theme.colors.neutral.text,
          color: "#fff",
          fontSize: 12,
          fontFamily: theme.fonts.body,
          lineHeight: 1.5,
          padding: "8px 12px",
          borderRadius: theme.radius.sm,
          width: 260,
          zIndex: 100,
          pointerEvents: "none",
          boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
        }}>
          {text}
          <span style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            borderWidth: 5,
            borderStyle: "solid",
            borderColor: `${theme.colors.neutral.text} transparent transparent transparent`,
          }} />
        </span>
      )}
    </span>
  )
}

function NinCell({ rowKey: _rowKey }: { rowKey: string }) {
  const [roast, setRoast] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleClick = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setRoast(pickRoast())
    timerRef.current = setTimeout(() => setRoast(null), 3500)
  }, [])

  if (roast) {
    return (
      <span style={{
        display: "block",
        fontSize: 12,
        fontStyle: "italic",
        color: theme.colors.pink[600],
        fontFamily: theme.fonts.body,
        lineHeight: 1.4,
        cursor: "pointer",
      }} onClick={handleClick}>
        {roast}
      </span>
    )
  }

  return (
    <span style={{ display: "block", cursor: "pointer" }} onClick={handleClick}>
      <span style={{
        display: "block",
        fontSize: 13,
        letterSpacing: 3,
        filter: "blur(8px)",
        userSelect: "none",
        color: theme.colors.neutral.text,
        fontFamily: "monospace",
      }}>
        {/* convincing 11-digit NIN placeholder */}
        12345678901
      </span>
      <span style={{
        display: "block",
        fontSize: 10,
        color: theme.colors.purple[400],
        marginTop: 2,
        fontFamily: theme.fonts.body,
      }}>
        Click to reveal
      </span>
    </span>
  )
}

const colStyle: React.CSSProperties = {
  padding: "12px 16px",
  textAlign: "left",
  fontSize: 13,
  color: theme.colors.neutral.text,
  fontFamily: theme.fonts.body,
  borderBottom: `1px solid ${theme.colors.neutral.border}`,
  verticalAlign: "top",
}

const headStyle: React.CSSProperties = {
  ...colStyle,
  fontSize: 11,
  fontWeight: 600,
  color: theme.colors.neutral.muted,
  textTransform: "uppercase" as const,
  letterSpacing: "0.06em",
  background: theme.colors.neutral.bg,
  borderBottom: `2px solid ${theme.colors.neutral.border}`,
}

export default function NinTable({ data }: { data: CustomerRow[] }) {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return data
    return data.filter(row =>
      row.fullname?.toLowerCase().includes(q) ||
      row.email?.toLowerCase().includes(q) ||
      row.fullphonenumber?.includes(q) ||
      row.permanentaddress?.toLowerCase().includes(q) ||
      row.loginid?.toLowerCase().includes(q)
    )
  }, [data, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const rows = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

  const handleSearch = (v: string) => {
    setSearch(v)
    setPage(1)
  }

  return (
    <div>
      {/* Search + count bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 16 }}>
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={e => handleSearch(e.target.value)}
          style={{
            flex: 1,
            maxWidth: 400,
            padding: "9px 14px",
            borderRadius: theme.radius.sm,
            border: `1px solid ${theme.colors.neutral.border}`,
            background: theme.colors.neutral.surface,
            fontSize: 14,
            fontFamily: theme.fonts.body,
            color: theme.colors.neutral.text,
            outline: "none",
          }}
        />
        <span style={{ fontSize: 13, color: theme.colors.neutral.muted, whiteSpace: "nowrap" }}>
          {filtered.length.toLocaleString()} {filtered.length === 1 ? "record" : "records"}
        </span>
      </div>

      {/* Table */}
      <div style={{
        background: theme.colors.neutral.surface,
        border: `1px solid ${theme.colors.neutral.border}`,
        borderRadius: theme.radius.lg,
        overflow: "hidden",
      }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={headStyle}>#</th>
                <th style={headStyle}>Full Name</th>
                <th style={headStyle}>Phone</th>
                <th style={headStyle}>Email</th>
                <th style={headStyle}>Address</th>
                <th style={{ ...headStyle, whiteSpace: "nowrap" }}>NIN</th>
                <th style={{ ...headStyle, whiteSpace: "nowrap" }}>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ ...colStyle, textAlign: "center", color: theme.colors.neutral.muted, padding: "40px 16px" }}>
                    No records found
                  </td>
                </tr>
              ) : (
                rows.map((row, i) => {
                  const rowNum = (currentPage - 1) * PER_PAGE + i + 1
                  const isPreLaunch = !row.fullname && !row.email && !row.fullphonenumber && !row.permanentaddress
                  const isEven = i % 2 === 1

                  const rowBg = isPreLaunch
                    ? theme.colors.purple[50]
                    : isEven ? theme.colors.neutral.bg : theme.colors.neutral.surface

                  const rowStyle: React.CSSProperties = isPreLaunch
                    ? { background: rowBg, boxShadow: `inset 3px 0 0 ${theme.colors.purple[200]}` }
                    : { background: rowBg }

                  return (
                    <tr key={i} style={rowStyle}>
                      <td style={{ ...colStyle, color: theme.colors.neutral.muted, width: 48 }}>{rowNum}</td>

                      <td style={{ ...colStyle, fontWeight: 500, whiteSpace: "nowrap" }}>
                        {isPreLaunch ? (
                          <span style={{ display: "flex", alignItems: "center" }}>
                            <span style={{ color: theme.colors.purple[600], fontStyle: "italic", fontWeight: 400 }}>
                              Pre-launch account
                            </span>
                            <Tooltip text="This person registered on the app before the March 2026 launch. Their profile details aren't in our records, but their NIN submission is real and has been counted." />
                          </span>
                        ) : (
                          row.fullname
                        )}
                      </td>

                      <td style={{ ...colStyle, whiteSpace: "nowrap" }}>{row.fullphonenumber || "—"}</td>
                      <td style={{ ...colStyle }}>{row.email || "—"}</td>
                      <td style={{ ...colStyle, maxWidth: 260, color: theme.colors.neutral.muted }}>{formatAddress(row.permanentaddress)}</td>
                      <td style={{ ...colStyle, minWidth: 120 }}>
                        <NinCell rowKey={`${currentPage}-${i}`} />
                      </td>
                      <td style={{ ...colStyle, whiteSpace: "nowrap", color: theme.colors.neutral.muted }}>{formatDate(row.customer_since)}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 16px",
            borderTop: `1px solid ${theme.colors.neutral.border}`,
            fontFamily: theme.fonts.body,
          }}>
            <span style={{ fontSize: 13, color: theme.colors.neutral.muted }}>
              Page {currentPage} of {totalPages}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: "6px 14px",
                  borderRadius: theme.radius.sm,
                  border: `1px solid ${theme.colors.neutral.border}`,
                  background: theme.colors.neutral.surface,
                  color: currentPage === 1 ? theme.colors.neutral.muted : theme.colors.neutral.text,
                  fontSize: 13,
                  cursor: currentPage === 1 ? "default" : "pointer",
                  fontFamily: theme.fonts.body,
                }}
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: "6px 14px",
                  borderRadius: theme.radius.sm,
                  border: `1px solid ${theme.colors.neutral.border}`,
                  background: theme.colors.neutral.surface,
                  color: currentPage === totalPages ? theme.colors.neutral.muted : theme.colors.neutral.text,
                  fontSize: 13,
                  cursor: currentPage === totalPages ? "default" : "pointer",
                  fontFamily: theme.fonts.body,
                }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
