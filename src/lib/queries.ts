import { supabase } from "./supabase"

export interface FilterOptions {
  month?: number // 1-12
  year?: number
}

/**
 * Helper to build Supabase date filters
 */
function buildDateFilter(query: any, dateColumn: string, filters: FilterOptions) {
  if (filters.year) {
    const start = new Date(filters.year, (filters.month || 1) - 1, 1).toISOString()
    const end = filters.month 
      ? new Date(filters.year, filters.month, 0, 23, 59, 59).toISOString()
      : new Date(filters.year, 11, 31, 23, 59, 59).toISOString()
    
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
  const { data: storePerf, error: storeError } = await storeQuery

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
  const { data, error } = await query.order('date', { ascending: true })

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
    .from('service_request')
    .select('requestcategory, createddate')
  
  query = buildDateFilter(query, 'createddate', filters)
  const { data, error } = await query.order('createddate', { ascending: true })

  if (error) {
    console.error("Error fetching service requests:", error)
    return []
  }

  // Group by date (ignoring time) and category
  const grouped: Record<string, { date: string, contact_us: number, enquire_now: number }> = {}

  data.forEach((row) => {
    const date = new Date(row.createddate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
    if (!grouped[date]) {
      grouped[date] = { date, contact_us: 0, enquire_now: 0 }
    }

    // Normalize category: lowercase and remove underscores/spaces for comparison
    const normalizedCat = row.requestcategory?.toLowerCase().replace(/[_\s]/g, "")
    
    if (normalizedCat === 'contactus') {
      grouped[date].contact_us++
    } else if (normalizedCat === 'enquirenow') {
      grouped[date].enquire_now++
    }
  })

  return Object.values(grouped)
}

/**
 * Fetch Account Health distribution
 */
export async function getAccountHealthStats(filters: FilterOptions = {}) {
  let query = supabase
    .from('user_login_accounts')
    .select('accountstatus')
  
  query = buildDateFilter(query, 'createddate', filters)
  const { data, error } = await query

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
  const { data, error } = await query

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
    .from('user_login_accounts')
    .select('createddate')
  
  query = buildDateFilter(query, 'createddate', filters)
  const { data, error } = await query.order('createddate', { ascending: true })

  if (error) {
    console.error("Error fetching daily registrations:", error)
    return []
  }

  const grouped: Record<string, { date: string, count: number }> = {}
  data.forEach((row) => {
    const d = new Date(row.createddate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
    if (!grouped[d]) grouped[d] = { date: d, count: 0 }
    grouped[d].count++
  })

  return Object.values(grouped)
}

/**
 * Get available years and months from the user_login_accounts table
 */
export async function getAvailableFilterOptions() {
  const { data, error } = await supabase
    .from('user_login_accounts')
    .select('createddate')
  
  if (error) return { years: [], months: [] }

  const years = new Set<number>()
  const months = new Set<number>()

  data.forEach(row => {
    const d = new Date(row.createddate)
    years.add(d.getFullYear())
    months.add(d.getMonth() + 1)
  })

  return {
    years: Array.from(years).sort((a, b) => b - a),
    months: Array.from(months).sort((a, b) => a - b)
  }
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
