import { theme } from "@/lib/theme"
import KpiCard from "@/components/dashboard/KpiCard"
import TrendChart from "@/components/dashboard/Trendchart"
import { PlatformDonut, CategoryDonut } from "@/components/dashboard/Donutchart"
import AccountHealth from "@/components/dashboard/Accounthealth"
import ServiceRequestChart from "@/components/dashboard/Servicerequestchart"
import TrafficSourceChart from "@/components/dashboard/Trafficsourcechart"
import CountryChart from "@/components/dashboard/Countrychart"
import PurchaseChart from "@/components/dashboard/Purchasechart"

// Mock Data
const MOCK_KPI_DATA = [
  { label: "Total reach", value: "2,450", sub: "store listing visitors", delta: "+5.1%", deltaType: "up", accent: "pink", icon: "↓" },
  { label: "Registered users", value: "₦1.2M", sub: "total accounts", delta: "+2.3%", deltaType: "up", accent: "purple", icon: "☺" },
  { label: "Service demand", value: "48", sub: "total requests", delta: "-8.4%", deltaType: "down", accent: "peach", icon: "✉" },
  { label: "Conversion rate", value: "1.2%", sub: "visitors -> installs", delta: "store listing", deltaType: "neutral", accent: "rose", icon: "◆" },
]

const MOCK_TREND_DATA = [
  { date: "Mar 01", visitors: 400, acquisitions: 240 },
  { date: "Mar 05", visitors: 300, acquisitions: 139 },
  { date: "Mar 10", visitors: 200, acquisitions: 980 },
  { date: "Mar 15", visitors: 278, acquisitions: 390 },
  { date: "Mar 20", visitors: 189, acquisitions: 480 },
]

const MOCK_PLATFORM_DATA = [
  { label: "Mobile", value: 65 },
  { label: "Desktop", value: 30 },
  { label: "Tablet", value: 5 },
]

const MOCK_CATEGORY_DATA = [
  { label: "Premium", value: 40 },
  { label: "Free", value: 55 },
  { label: "Trial", value: 5 },
]

const MOCK_SERVICE_REQUESTS = [
  { date: "Mon", contact_us: 12, enquire_now: 8 },
  { date: "Tue", contact_us: 15, enquire_now: 10 },
  { date: "Wed", contact_us: 10, enquire_now: 12 },
  { date: "Thu", contact_us: 20, enquire_now: 7 },
  { date: "Fri", contact_us: 18, enquire_now: 15 },
]

const MOCK_TRAFFIC_SOURCES = [
  { source: "Google Search", acquisitions: 450 },
  { source: "Direct", acquisitions: 320 },
  { source: "Social Media", acquisitions: 180 },
  { source: "Referral", acquisitions: 95 },
]

const MOCK_COUNTRIES = [
  { country: "Nigeria", acquisitions: 850 },
  { country: "Ghana", acquisitions: 240 },
  { country: "Kenya", acquisitions: 180 },
  { country: "United Kingdom", acquisitions: 120 },
]

const MOCK_PURCHASES = [
  { date: "Mar 01", items: 45, vehicles: 12 },
  { date: "Mar 08", items: 52, vehicles: 8 },
  { date: "Mar 15", items: 38, vehicles: 15 },
  { date: "Mar 22", items: 64, vehicles: 10 },
]

export default function DashboardPage() {
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
          {MOCK_KPI_DATA.map((kpi, i) => (
            //@ts-ignore - accent mapping helper in KpiCard
            <KpiCard key={i} {...kpi} />
          ))}
        </div>

        {/* Main Charts Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 24,
          marginBottom: 24,
        }}>
          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <TrendChart data={MOCK_TREND_DATA} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <ServiceRequestChart data={MOCK_SERVICE_REQUESTS} />
              <AccountHealth active={1450} inactive={820} expired={180} />
            </div>
            <PurchaseChart data={MOCK_PURCHASES} />
          </div>

          {/* Right Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <PlatformDonut data={MOCK_PLATFORM_DATA} />
            <CategoryDonut data={MOCK_CATEGORY_DATA} totalUsers={2450} />
            <TrafficSourceChart data={MOCK_TRAFFIC_SOURCES} />
            <CountryChart data={MOCK_COUNTRIES} />
          </div>
        </div>
      </div>
    </div>
  )
}
