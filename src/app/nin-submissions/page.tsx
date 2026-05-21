export const dynamic = 'force-dynamic'
export const revalidate = 0

import Link from "next/link"
import { theme } from "@/lib/theme"
import styles from "../page.module.css"
import NinTable from "@/components/dashboard/NinTable"
import { getCustomerDetails } from "@/lib/queries"

export default async function NinSubmissionsPage() {
  const customers = await getCustomerDetails()

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.innerContent}>

        {/* Header */}
        <header style={{ marginBottom: 32 }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: theme.colors.purple[600],
              textDecoration: "none",
              fontFamily: theme.fonts.body,
              marginBottom: 16,
            }}
          >
            ← Back to Dashboard
          </Link>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
            <div>
              <h1 style={{
                fontFamily: theme.fonts.display,
                fontSize: 32,
                color: theme.colors.neutral.text,
                margin: 0,
                marginBottom: 8,
              }}>
                NIN Submissions
              </h1>
              <p style={{
                fontFamily: theme.fonts.body,
                fontSize: 13,
                color: theme.colors.neutral.muted,
                margin: 0,
              }}>
                Users who have entered their National Identification Number into the app
              </p>
            </div>

            {/* Summary card */}
            <div style={{
              background: theme.colors.neutral.surface,
              border: `1px solid ${theme.colors.neutral.border}`,
              borderRadius: theme.radius.lg,
              padding: "16px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              minWidth: 160,
            }}>
              <span style={{ fontSize: 11, color: theme.colors.neutral.muted, fontFamily: theme.fonts.body, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Total submissions
              </span>
              <span style={{ fontFamily: theme.fonts.display, fontSize: 32, color: theme.colors.neutral.text, lineHeight: 1 }}>
                {customers.length.toLocaleString()}
              </span>
              <span style={{ fontSize: 11, color: theme.colors.purple[600], fontFamily: theme.fonts.body, marginTop: 2 }}>
                NIN registered users
              </span>
            </div>
          </div>
        </header>

        {/* Table */}
        <NinTable data={customers} />

      </div>
    </div>
  )
}
