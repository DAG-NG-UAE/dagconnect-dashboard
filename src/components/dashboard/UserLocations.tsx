"use client"
import dynamicImport from "next/dynamic"
import { theme } from "@/lib/theme"

interface UserLocation {
  lat: number
  lng: number
  state: string
  city: string
}

interface UserLocationsProps {
  locations: UserLocation[]
}

// Dynamically import the Leaflet component with SSR disabled
const UserMap = dynamicImport(() => import("./UserMap"), { 
  ssr: false,
  loading: () => (
    <div style={{ 
      height: 450, 
      background: theme.colors.neutral.surface, 
      borderRadius: theme.radius.lg, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      color: theme.colors.neutral.muted,
      border: `1px solid ${theme.colors.neutral.border}`
    }}>
       Loading Nigeria Activity Map...
    </div>
  )
})

export default function UserLocations({ locations }: UserLocationsProps) {
  return <UserMap locations={locations} />
}
