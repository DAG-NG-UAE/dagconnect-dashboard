"use client"
import { useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { theme } from '@/lib/theme'

interface UserLocation {
  lat: number
  lng: number
  state: string
  city: string
}

interface UserMapProps {
  locations: UserLocation[]
}

export default function UserMap({ locations }: UserMapProps) {
  const NIGERIA_CENTER: [number, number] = [9.082, 8.675]
  const [selectedState, setSelectedState] = useState<string | null>(null)

  // Group by state for the ranked list
  const groupedByState = locations.reduce((acc, loc) => {
    const state = loc.state || 'Unknown'
    if (!acc[state]) acc[state] = 0
    acc[state]++
    return acc
  }, {} as Record<string, number>)

  const locationStats = Object.entries(groupedByState)
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // When a state is clicked, compute top cities for that state
  const topCitiesForState = selectedState
    ? Object.entries(
        locations
          .filter(loc => loc.state === selectedState)
          .reduce((acc, loc) => {
            const city = loc.city || 'Unknown'
            if (!acc[city]) acc[city] = 0
            acc[city]++
            return acc
          }, {} as Record<string, number>)
      )
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    : []

  return (
    <div style={{
      background: theme.colors.neutral.surface,
      border: `1px solid ${theme.colors.neutral.border}`,
      borderRadius: theme.radius.lg,
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      gap: 20,
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 20, fontFamily: theme.fonts.display, color: theme.colors.neutral.text }}>
            User Distribution by State
          </div>
          <div style={{ fontSize: 13, color: theme.colors.neutral.muted, marginTop: 4 }}>
            Geographic activity based on login refresh locations
          </div>
        </div>
        <div style={{ 
          background: theme.colors.pink[50], 
          color: theme.colors.pink[600], 
          padding: "6px 14px", 
          borderRadius: 100, 
          fontSize: 12, 
          fontWeight: 600,
          border: `1px solid ${theme.colors.pink[100]}`
        }}>
          {locations.length} Active Records
        </div>
      </div>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1.2fr 1fr", 
        gap: 24,
        minHeight: "480px"
      }}>
        {/* The Map */}
        <div style={{ 
          borderRadius: theme.radius.md, 
          overflow: "hidden",
          border: `1px solid ${theme.colors.neutral.border}`,
          height: "100%",
          position: "relative"
        }}>
          <MapContainer 
            center={NIGERIA_CENTER} 
            zoom={6} 
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            {locations.map((loc, idx) => (
              <CircleMarker 
                key={idx}
                center={[loc.lat, loc.lng]}
                radius={6}
                pathOptions={{
                  // Highlight dots that belong to the selected state
                  fillColor: selectedState && loc.state === selectedState 
                    ? theme.colors.pink[600] 
                    : selectedState 
                      ? theme.colors.neutral.border  // dim others
                      : theme.colors.pink[600],
                  color: "#fff",
                  weight: 2,
                  opacity: 1,
                  fillOpacity: selectedState && loc.state !== selectedState ? 0.2 : 0.8
                }}
              >
                <Tooltip direction="top" offset={[0, -5]} opacity={1}>
                  <div style={{ padding: "4px 2px" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: theme.colors.neutral.text }}>
                      {loc.city}
                    </div>
                    <div style={{ fontSize: 11, color: theme.colors.neutral.muted }}>
                      {loc.state}
                    </div>
                  </div>
                </Tooltip>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        {/* The Stats Table */}
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: 16,
          padding: "16px",
          background: theme.colors.neutral.bg,
          borderRadius: theme.radius.md,
          border: `1px solid ${theme.colors.neutral.border}`,
          overflowY: "auto",
          maxHeight: 480
        }}>

          {/* Either show city breakdown or the full state list */}
          {selectedState ? (
            <>
              {/* City breakdown header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: theme.colors.neutral.text }}>
                    {selectedState}
                  </div>
                  <div style={{ fontSize: 11, color: theme.colors.neutral.muted, marginTop: 2 }}>
                    Top cities by active users
                  </div>
                </div>
                <button
                  onClick={() => setSelectedState(null)}
                  style={{
                    background: theme.colors.pink[50],
                    border: `1px solid ${theme.colors.pink[100]}`,
                    borderRadius: 100,
                    color: theme.colors.pink[600],
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "4px 10px",
                    cursor: "pointer"
                  }}
                >
                  ← Back
                </button>
              </div>

              {/* City rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {topCitiesForState.map((item, i) => (
                  <div key={i} style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    background: theme.colors.neutral.surface,
                    borderRadius: theme.radius.sm,
                    border: `1px solid ${theme.colors.neutral.border}`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ 
                        width: 24, height: 24, borderRadius: "50%", 
                        background: theme.colors.pink[50], color: theme.colors.pink[600],
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, fontWeight: 800
                      }}>
                        {i + 1}
                      </div>
                      <div style={{ fontSize: 14, color: theme.colors.neutral.text, fontWeight: 500 }}>
                        {item.city}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: theme.colors.neutral.text }}>
                      {item.count} <span style={{ fontSize: 11, color: theme.colors.neutral.muted, fontWeight: 400 }}>users</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Default state list */}
              <div style={{ fontSize: 14, fontWeight: 600, color: theme.colors.neutral.text, marginBottom: 4 }}>
                Top Active Regions
                <span style={{ fontSize: 11, color: theme.colors.neutral.muted, fontWeight: 400, marginLeft: 8 }}>
                  click a state to see cities
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {locationStats.map((stat, i) => (
                  <div 
                    key={i} 
                    onClick={() => setSelectedState(stat.state)}
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      background: theme.colors.neutral.surface,
                      borderRadius: theme.radius.sm,
                      border: `1px solid ${theme.colors.neutral.border}`,
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = theme.colors.pink[200])}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = theme.colors.neutral.border)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ 
                        width: 24, height: 24, borderRadius: "50%", 
                        background: theme.colors.pink[50], color: theme.colors.pink[600],
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, fontWeight: 800
                      }}>
                        {i + 1}
                      </div>
                      <div style={{ fontSize: 14, color: theme.colors.neutral.text, fontWeight: 500 }}>
                        {stat.state}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: theme.colors.neutral.text }}>
                      {stat.count} <span style={{ fontSize: 11, color: theme.colors.neutral.muted, fontWeight: 400 }}>users</span>
                    </div>
                  </div>
                ))}
              </div>
              {locationStats.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 0', color: theme.colors.neutral.muted, fontSize: 14 }}>
                  No active session data found
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}