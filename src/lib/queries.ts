import { supabase } from "./supabase"

/**
 * Fetch top-level KPIs for the Dashboard
 * - Total Reach (Store listing visitors)
 * - Registered Users (Account count)
 * - Service Demand (Total requests)
 * - Conversion Rate (Store listing conversion)
 */
export async function getKpiSummary() {
  // 1. Total Reach & Conversion Rate from store_performance_country
  const { data: storePerf, error: storeError } = await supabase
    .from('store_performance_country')
    .select('store_listing_visitors, store_listing_conversion_rate')

  if (storeError) console.error("Error fetching store performance:", storeError)


  const totalVisitors = storePerf?.reduce((sum, row) => sum + (row.store_listing_visitors || 0), 0) || 0
  const avgConversion = storePerf?.length 
    ? (storePerf.reduce((sum, row) => sum + (row.store_listing_conversion_rate || 0), 0) / storePerf.length) * 100
    : 0

  // 2. Registered Users count
  const { count: userCount, error: userError } = await supabase
    .from('user_login_accounts')
    .select('*', { count: 'exact', head: true })

  if (userError) console.error("Error fetching user count:", userError)

  // 3. Service Demand (Total service requests)
  const { count: requestCount, error: requestError } = await supabase
    .from('service_request')
    .select('*', { count: 'exact', head: true })

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
export async function getTrendData() {
  const { data, error } = await supabase
    .from('store_performance_country')
    .select('date, store_listing_visitors, store_listing_acquisitions')
    .order('date', { ascending: true })

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
export async function getServiceRequestStats() {
  const { data, error } = await supabase
    .from('service_request')
    .select('requestcategory, createddate')
    .order('createddate', { ascending: true })

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

  return Object.values(grouped).slice(-5) // Return last 5 days
}

/**
 * Fetch Account Health distribution
 */
export async function getAccountHealthStats() {
  const { data, error } = await supabase
    .from('user_login_accounts')
    .select('accountstatus')

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
export async function getAccountDistributions() {
  const { data, error } = await supabase
    .from('user_login_accounts')
    .select('platform, usercategory')

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
export async function getTrafficSourceStats() {
  const { data, error } = await supabase
    .from('store_performance_traffic_source')
    .select('traffic_source, store_listing_acquisitions')

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
export async function getCountryStats() {
  const { data, error } = await supabase
    .from('store_performance_country')
    .select('country_region, store_listing_acquisitions')

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
export async function getPurchaseStats() {
  const { data: items, error: iErr } = await supabase.from('purchased_items').select('createddate')
  const { data: vehicles, error: vErr } = await supabase.from('purchased_vehicle_items').select('createddate')
  
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

  return Object.values(grouped).slice(-4)
}
