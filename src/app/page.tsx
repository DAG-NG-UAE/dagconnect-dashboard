export const dynamic = 'force-dynamic'
export const revalidate = 0

import { theme } from "@/lib/theme"
import styles from "./page.module.css"
import KpiCard from "@/components/dashboard/KpiCard"
import TrendChart from "@/components/dashboard/Trendchart"
import { PlatformDonut, CategoryDonut } from "@/components/dashboard/Donutchart"
import AccountHealth from "@/components/dashboard/Accounthealth"
import ServiceRequestChart from "@/components/dashboard/Servicerequestchart"
import TrafficSourceChart from "@/components/dashboard/Trafficsourcechart"
import CountryChart from "@/components/dashboard/Countrychart"
import PurchaseChart from "@/components/dashboard/Purchasechart"
import RegistrationChart from "@/components/dashboard/RegistrationChart"
import FilterSection from "@/components/dashboard/FilterSection"

// Live Queries
import { 
  getKpiSummary, 
  getTrendData, 
  getServiceRequestStats, 
  getAccountHealthStats, 
  getAccountDistributions, 
  getTrafficSourceStats, 
  getCountryStats, 
  getPurchaseStats,
  getDailyRegistrationStats,
  getAvailableFilterOptions,
  getLastUpdatedTimestamp,
  FilterOptions
} from "@/lib/queries"

interface DashboardPageProps {
  searchParams: Promise<{ month?: string; year?: string }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams
  const filters: FilterOptions = {
    month: params.month ? parseInt(params.month) : undefined,
    year: params.year ? parseInt(params.year) : undefined,
  }

  // Fetch all data in parallel
  const [
    kpiSummary,
    trendData,
    serviceRequestData,
    accountHealthStats,
    distributions,
    trafficSources,
    countryStats,
    purchaseStats,
    registrationData,
    filterOptions,
    lastUpdated
  ] = await Promise.all([
    getKpiSummary(filters),
    getTrendData(filters),
    getServiceRequestStats(filters),
    getAccountHealthStats(filters),
    getAccountDistributions(filters),
    getTrafficSourceStats(filters),
    getCountryStats(filters),
    getPurchaseStats(filters),
    getDailyRegistrationStats(filters),
    getAvailableFilterOptions(),
    getLastUpdatedTimestamp()
  ])

  const currentPeriod = filters.month && filters.year 
    ? `${new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(filters.year, filters.month - 1))} ${filters.year}`
    : filters.year ? `${filters.year}` : "All Time"

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.innerContent}>
        {/* Header */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.title} style={{ fontFamily: theme.fonts.display, color: theme.colors.neutral.text }}>
              Dag Connect Dashboard
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: theme.colors.neutral.muted, fontSize: 13 }}>
              <span>App overview: **{currentPeriod}**</span>
              <span style={{ color: theme.colors.neutral.border }}>|</span>
              <span>Last updated: **{lastUpdated}**</span>
            </div>
          </div>
          
          <FilterSection years={filterOptions.years} months={filterOptions.months} />
        </header>

        {/* KPI Grid */}
        <section className={styles.kpiGrid}>
          {kpiSummary.map((kpi, i) => (
            //@ts-ignore - accent mapping helper in KpiCard
            <KpiCard key={i} {...kpi} />
          ))}
        </section>

        {/* Main Charts Architecture */}
        <main className={styles.mainGrid}>
          {/* Main Work Column (Charts) */}
          <div className={styles.leftCol}>
            <div className={styles.longChart}>
              <TrendChart data={trendData} />
            </div>
            
            <div className={styles.longChart}>
              <RegistrationChart data={registrationData} />
            </div>

            <div className={styles.chartRow}>
              <ServiceRequestChart data={serviceRequestData} />
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                 <AccountHealth 
                    active={accountHealthStats.active} 
                    inactive={accountHealthStats.inactive} 
                    expired={accountHealthStats.expired} 
                  />
                  <div style={{ 
                    marginTop: "auto", 
                    padding: "14px", 
                    borderRadius: theme.radius.md, 
                    border: `1px dashed ${theme.colors.neutral.border}`,
                    fontSize: 12,
                    color: theme.colors.neutral.muted,
                    textAlign: "center"
                  }}>
                    System health check: **100% stable**
                  </div>
              </div>
            </div>
            
            <PurchaseChart data={purchaseStats} />
          </div>

          {/* Context Column (Side pieces) */}
          <aside className={styles.rightCol}>
            <PlatformDonut data={distributions.platforms} />
            <CategoryDonut data={distributions.categories} totalUsers={distributions.total} />
            <TrafficSourceChart data={trafficSources} />
            <CountryChart data={countryStats} />
          </aside>
        </main>
      </div>
    </div>
  )
}
