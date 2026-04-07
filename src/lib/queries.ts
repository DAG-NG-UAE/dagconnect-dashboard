import { supabase } from "./supabase"

export interface FilterOptions {
  month?: number // 1-12
  year?: number
}

/**
 * Helper to build Supabase date filters
 */
function buildDateFilter(query: any, dateColumn: string, filters: FilterOptions) {
  const year = filters.year ?? (filters.month ? 2026 : undefined)
  if (year) {
    const start = new Date(year, (filters.month || 1) - 1, 1).toISOString()
    const end = filters.month
      ? new Date(year, filters.month, 0, 23, 59, 59).toISOString()
      : new Date(year, 11, 31, 23, 59, 59).toISOString()

    return query.gte(dateColumn, start).lte(dateColumn, end)
  }
  return query
}

/**
 * Fetch top-level KPIs for the Dashboard
 * - Total Reach (Store listing visitors)
 * - Registered Users (Account count)
 * - Service Demand (Total requests)
 * - Conversion Rate (Store listing conversion)
 */
export async function getKpiSummary(filters: FilterOptions = {}) {
  // 1. Total Reach & Conversion Rate from store_performance_country
  let storeQuery = supabase
    .from('store_performance_country')
    .select('store_listing_visitors, store_listing_conversion_rate')

  storeQuery = buildDateFilter(storeQuery, 'date', filters)
  const { data: storePerf, error: storeError } = await storeQuery.limit(10000)

  if (storeError) console.error("Error fetching store performance:", storeError)


  const totalVisitors = storePerf?.reduce((sum, row) => sum + (row.store_listing_visitors || 0), 0) || 0
  const avgConversion = storePerf?.length
    ? (storePerf.reduce((sum, row) => sum + (row.store_listing_conversion_rate || 0), 0) / storePerf.length) * 100
    : 0

  // 2. Registered Users count
  let userQuery = supabase
    .from('user_login_accounts')
    .select('*', { count: 'exact', head: true })

  userQuery = buildDateFilter(userQuery, 'createddate', filters)
  const { count: userCount, error: userError } = await userQuery

  if (userError) console.error("Error fetching user count:", userError)

  // 3. Service Demand (Total service requests)
  let requestQuery = supabase
    .from('service_request')
    .select('*', { count: 'exact', head: true })

  requestQuery = buildDateFilter(requestQuery, 'createddate', filters)
  const { count: requestCount, error: requestError } = await requestQuery

  if (requestError) console.error("Error fetching request count:", requestError)

  return [
    {
      label: "Total reach",
      value: totalVisitors.toLocaleString(),
      sub: "store listing visitors",
      delta: "", // decide if we want to be able to show them how many people visited the store per day or per week or per month
      deltaType: "neutral",
      accent: "pink",
      icon: "↓"
    },
    {
      label: "Registered users",
      value: (userCount || 0).toLocaleString(),
      sub: "total accounts",
      delta: "",
      deltaType: "neutral",
      accent: "purple",
      icon: "☺"
    },
    {
      label: "Service demand",
      value: (requestCount || 0).toLocaleString(),
      sub: "total requests",
      delta: "",
      deltaType: "neutral",
      accent: "peach",
      icon: "✉"
    },
    {
      label: "Conversion rate",
      value: `${avgConversion.toFixed(1)}%`,
      sub: "visitors -> installs",
      delta: "store listing",
      deltaType: "neutral",
      accent: "rose",
      icon: "◆"
    },
  ]
}

/**
 * Fetch Trend Data (Visitors vs Acquisitions)
 * Uses store_performance_country grouped by date
 */
export async function getTrendData(filters: FilterOptions = {}) {
  let query = supabase
    .from('store_performance_country')
    .select('date, store_listing_visitors, store_listing_acquisitions')

  query = buildDateFilter(query, 'date', filters)
  const { data, error } = await query.order('date', { ascending: true }).limit(10000)

  if (error) {
    console.error("Error fetching trend data:", error)
    return []
  }

  // Aggregate by date (since country/region might have multiple rows per date)
  const aggregated: Record<string, { date: string, visitors: number, acquisitions: number }> = {}

  data.forEach((row) => {
    if (!aggregated[row.date]) {
      aggregated[row.date] = { date: row.date, visitors: 0, acquisitions: 0 }
    }
    aggregated[row.date].visitors += row.store_listing_visitors || 0
    aggregated[row.date].acquisitions += row.store_listing_acquisitions || 0
  })

  return Object.values(aggregated)
}

/**
 * Fetch Service Request distribution (contact_us vs enquire_now)
 */
export async function getServiceRequestStats(filters: FilterOptions = {}) {
  let query = supabase
    .from('service_request_stats_view')
    .select('request_date, contact_us_count, enquire_now_count')

  const srYear = filters.year ?? (filters.month ? 2026 : undefined)
  if (srYear) {
    const start = new Date(srYear, (filters.month || 1) - 1, 1).toISOString()
    const end = filters.month
      ? new Date(srYear, filters.month, 0, 23, 59, 59).toISOString()
      : new Date(srYear, 11, 31, 23, 59, 59).toISOString()

    query = query.gte('request_date', start).lte('request_date', end)
  }

  const { data, error } = await query.order('request_date', { ascending: true })

  if (error) {
    console.error("Error fetching service request view:", error)
    return []
  }

  return data.map(row => ({
    date: new Date(row.request_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
    contact_us: row.contact_us_count,
    enquire_now: row.enquire_now_count
  }))
}

/**
 * Fetch Account Health distribution
 */
export async function getAccountHealthStats(filters: FilterOptions = {}) {
  let query = supabase
    .from('user_login_accounts')
    .select('accountstatus')

  query = buildDateFilter(query, 'createddate', filters)
  const { data, error } = await query.limit(10000)

  if (error) {
    console.error("Error fetching account status:", error)
    return { active: 0, inactive: 0, expired: 0 }
  }

  const stats = { active: 0, inactive: 0, expired: 0 }
  data.forEach((row) => {
    const status = row.accountstatus?.toLowerCase()
    if (status === 'active') stats.active++
    else if (status === 'inactive') stats.inactive++
    else if (status === 'expired') stats.expired++
  })

  return stats
}

/**
 * Fetch Platform and User category distributions for Donut charts
 */
export async function getAccountDistributions(filters: FilterOptions = {}) {
  let query = supabase
    .from('user_login_accounts')
    .select('platform, usercategory')

  query = buildDateFilter(query, 'createddate', filters)
  const { data, error } = await query.limit(10000)

  if (error) {
    console.error("Error fetching distributions:", error)
    return { platforms: [], categories: [], total: 0 }
  }

  const platforms: Record<string, number> = {}
  const categories: Record<string, number> = {}

  data.forEach((row) => {
    const p = row.platform || "Unknown"
    const c = row.usercategory || "Unknown"
    platforms[p] = (platforms[p] || 0) + 1
    categories[c] = (categories[c] || 0) + 1
  })

  const total = data.length

  return {
    platforms: Object.entries(platforms).map(([label, count]) => ({
      label,
      value: Math.round((count / total) * 100)
    })),
    categories: Object.entries(categories).map(([label, count]) => ({
      label,
      value: Math.round((count / total) * 100)
    })),
    total
  }
}

/**
 * Fetch Traffic Source data
 */
export async function getTrafficSourceStats(filters: FilterOptions = {}) {
  let query = supabase
    .from('store_performance_traffic_source')
    .select('traffic_source, store_listing_acquisitions')

  query = buildDateFilter(query, 'date', filters)
  const { data, error } = await query

  if (error) {
    console.error("Error fetching traffic sources:", error)
    return []
  }

  const stats: Record<string, number> = {}
  data.forEach((row) => {
    stats[row.traffic_source] = (stats[row.traffic_source] || 0) + (row.store_listing_acquisitions || 0)
  })

  return Object.entries(stats)
    .map(([source, acquisitions]) => ({ source, acquisitions }))
    .sort((a, b) => b.acquisitions - a.acquisitions)
    .slice(0, 5)
}

/**
 * Fetch Country data
 */
export async function getCountryStats(filters: FilterOptions = {}) {
  let query = supabase
    .from('store_performance_country')
    .select('country_region, store_listing_acquisitions')

  query = buildDateFilter(query, 'date', filters)
  const { data, error } = await query

  if (error) {
    console.error("Error fetching country stats:", error)
    return []
  }

  const stats: Record<string, number> = {}
  data.forEach((row) => {
    const country = row.country_region === 'NG' ? 'Nigeria' : row.country_region
    stats[country] = (stats[country] || 0) + (row.store_listing_acquisitions || 0)
  })

  return Object.entries(stats)
    .map(([country, acquisitions]) => ({ country, acquisitions }))
    .sort((a, b) => b.acquisitions - a.acquisitions)
    .slice(0, 5)
}

/**
 * Fetch Purchased items vs vehicles
 */
export async function getPurchaseStats(filters: FilterOptions = {}) {
  let iQuery = supabase.from('purchased_items').select('createddate')
  let vQuery = supabase.from('purchased_vehicle_items').select('createddate')

  iQuery = buildDateFilter(iQuery, 'createddate', filters)
  vQuery = buildDateFilter(vQuery, 'createddate', filters)

  const { data: items, error: iErr } = await iQuery
  const { data: vehicles, error: vErr } = await vQuery

  if (iErr || vErr) {
    console.error("Error fetching purchase stats:", iErr || vErr)
    return []
  }

  const grouped: Record<string, { date: string, items: number, vehicles: number }> = {}

  items?.forEach(row => {
    const d = new Date(row.createddate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
    if (!grouped[d]) grouped[d] = { date: d, items: 0, vehicles: 0 }
    grouped[d].items++
  })

  vehicles?.forEach(row => {
    const d = new Date(row.createddate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
    if (!grouped[d]) grouped[d] = { date: d, items: 0, vehicles: 0 }
    grouped[d].vehicles++
  })

  return Object.values(grouped)
}

/**
 * Fetch daily registration stats
 */
export async function getDailyRegistrationStats(filters: FilterOptions = {}) {
  let query = supabase
    .from('daily_registrations_view')
    .select('registration_date, registration_count')

  // Use YYYY-MM-DD strings to match the date-only registration_date column.
  // Default to 2026 if a month is selected but no year is provided.
  const year = filters.year ?? (filters.month ? 2026 : undefined)

  if (year && filters.month) {
    const lastDay = new Date(year, filters.month, 0).getDate()
    const start = `${year}-${filters.month.toString().padStart(2, '0')}-01`
    const end = `${year}-${filters.month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`
    query = query.gte('registration_date', start).lte('registration_date', end)
  } else if (year) {
    const start = `${year}-01-01`
    const end = `${year}-12-31`
    query = query.gte('registration_date', start).lte('registration_date', end)
  }

  const { data, error } = await query.order('registration_date', { ascending: true })
  if (error) {
    console.error("Error fetching daily registrations view:", error)
    return []
  }
  // Format colors/labels for Recharts
  return data.map(row => ({
    date: new Date(row.registration_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
    count: row.registration_count
  }))
}

/**
 * Get available years and months from the user_login_accounts table
 */
export async function getAvailableFilterOptions() {
  const { data, error } = await supabase
    .from('filter_options_view')
    .select('year, month')

  if (error) {
    console.error('Error fetching filter_options_view', error)
    return { years: [], months: [] }
  }

  const years = [...new Set(data.map(r => r.year))].sort((a, b) => b - a)
  const months = [...new Set(data.map(r => r.month))].sort((a, b) => a - b)

  return { years, months }
}

/**
 * Fetch the single most recent 'createddate' across key tables
 * to act as a "Last updated" signal for the dashboard.
 */
export async function getLastUpdatedTimestamp() {
  const tables = [
    'user_login_accounts',
    'service_request',
    'store_performance_country',
    'store_performance_traffic_source'
  ]

  const results = await Promise.all(
    tables.map(table =>
      supabase
        .from(table)
        .select('createddate')
        .order('createddate', { ascending: false })
        .limit(1)
        .maybeSingle()
    )
  )

  const dates = results
    .filter(r => !r.error && r.data?.createddate)
    .map(r => new Date(r.data!.createddate).getTime())

  if (dates.length === 0) return "N/A"

  const latest = new Date(Math.max(...dates))

  return latest.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC'
  }) + " (UTC)"
}

/**
 * Fetch the latest login location for each user
 * Logic: Join user_login_accounts to the latest activity row (OTP/LOGIN)
 */
export async function getUserLocations() {
  const activities = ['OTP_TRIGGER', 'OTP_VALIDATION', 'LOGIN_REFRESH']

  const { data, error } = await supabase
    .from('latest_user_locations')
    .select('loginid, latitude, longitude, createddate, activity, address')

  if (error) {
    console.error("Error fetching user locations:", error)
    return []
  }

  // Group by loginid in JS to get the 'latest' per user
  const latestPerUser: Record<string, { lat: number, lng: number, state: string, city: string }> = {}

  data.forEach(row => {
    if (!latestPerUser[row.loginid]) {
      let state = 'Unknown'
      let city = 'Unknown'

      if (row.address) {
        try {
          // If it's already an object, use it directly, otherwise parse if it's a string
          const addr = typeof row.address === 'string' ? JSON.parse(row.address) : row.address
          state = addr.state || addr.county || 'Nigeria'
          city = addr.city || addr.town || addr.village || 'Unknown'
        } catch (e) {
          // Fallback if parsing fails
        }
      }

      latestPerUser[row.loginid] = {
        lat: parseFloat(row.latitude.toString()),
        lng: parseFloat(row.longitude.toString()),
        state,
        city
      }
    }
  })

  return Object.values(latestPerUser)
}

