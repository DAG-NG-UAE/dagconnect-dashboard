import { theme } from "@/lib/theme"
import KpiCard from "@/components/dashboard/KpiCard"
import TrendChart from "@/components/dashboard/Trendchart"
import { PlatformDonut, CategoryDonut } from "@/components/dashboard/Donutchart"
import AccountHealth from "@/components/dashboard/Accounthealth"
import ServiceRequestChart from "@/components/dashboard/Servicerequestchart"
import TrafficSourceChart from "@/components/dashboard/Trafficsourcechart"
import CountryChart from "@/components/dashboard/Countrychart"
import PurchaseChart from "@/components/dashboard/Purchasechart"

// Live Queries
import { 
  getKpiSummary, 
  getTrendData, 
  getServiceRequestStats, 
  getAccountHealthStats, 
  getAccountDistributions, 
  getTrafficSourceStats, 
  getCountryStats, 
  getPurchaseStats 
} from "@/lib/queries"

export default async function DashboardPage() {
  // Fetch all data in parallel
  const [
    kpiSummary,
    trendData,
    serviceRequestData,
    accountHealthStats,
    distributions,
    trafficSources,
    countryStats,
    purchaseStats
  ] = await Promise.all([
    getKpiSummary(),
    getTrendData(),
    getServiceRequestStats(),
    getAccountHealthStats(),
    getAccountDistributions(),
    getTrafficSourceStats(),
    getCountryStats(),
    getPurchaseStats()
  ])

  return (
    <div style={{
      background: theme.colors.neutral.bg,
      minHeight: "100vh",
      padding: "24px",
      fontFamily: theme.fonts.body,
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Header */}
        <header style={{ marginBottom: 32 }}>
          <h1 style={{
            fontFamily: theme.fonts.display,
            fontSize: 32,
            color: theme.colors.neutral.text,
            marginBottom: 8,
          }}>
            Dag Connect Dashboard
          </h1>
          <p style={{ color: theme.colors.neutral.muted }}>
            App performance overview: March 2026
          </p>
        </header>

        {/* KPI Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 20,
          marginBottom: 32,
        }}>
          {kpiSummary.map((kpi, i) => (
            //@ts-ignore - accent mapping helper in KpiCard
            <KpiCard key={i} {...kpi} />
          ))}
        </div>

        {/* Main Charts Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr",
          gap: 24,
          marginBottom: 24,
        }}>
          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <TrendChart data={trendData} />
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.1fr", gap: 24 }}>
              <ServiceRequestChart data={serviceRequestData} />
              <AccountHealth 
                active={accountHealthStats.active} 
                inactive={accountHealthStats.inactive} 
                expired={accountHealthStats.expired} 
              />
            </div>
            <PurchaseChart data={purchaseStats} />
          </div>

          {/* Right Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <PlatformDonut data={distributions.platforms} />
            <CategoryDonut data={distributions.categories} totalUsers={distributions.total} />
            <TrafficSourceChart data={trafficSources} />
            <CountryChart data={countryStats} />
          </div>
        </div>
      </div>
    </div>
  )
}
