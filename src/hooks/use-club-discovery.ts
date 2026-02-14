import { useState, useCallback } from "react"
import { pb } from "@/lib/pb"
import type { ClubsResponse as ClubsResponseType } from "@/types/pocketbase-types"

export function useClubDiscovery() {
  const [isLocating, setIsLocating] = useState(false)
  const [nearbyClubs, setNearbyClubs] = useState<ClubsResponseType[]>([])

  const findNearbyClubs = useCallback(async () => {
    if (!("geolocation" in navigator)) {
      throw new Error("Geolocation is not supported by your browser")
    }

    setIsLocating(true)
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000, // Increased timeout to 10s
          maximumAge: 0,
        })
      })

      const { latitude, longitude } = position.coords
      console.log(`Searching for clubs near ${latitude}, ${longitude}`)

      // Fetch all clubs with coordinates
      const clubs = await pb.collection("clubs").getFullList<ClubsResponseType>({
        filter: "lat != null && lng != null",
        expand: "region,region.country",
        requestKey: "nearby_clubs_discovery"
      })

      if (clubs.length === 0) {
        console.warn("No clubs found with coordinates in the database")
      }

      // Calculate distance using Haversine formula and sort
      const sortedClubs = clubs.map(club => {
        const d = calculateDistance(latitude, longitude, club.lat!, club.lng!)
        return { ...club, distance: d }
      }).sort((a, b) => (a as any).distance - (b as any).distance)
      .slice(0, 25)

      setNearbyClubs(sortedClubs)
      return sortedClubs
    } finally {
      setIsLocating(false)
    }
  }, [])

  const findByCode = useCallback(async (code: string) => {
    try {
      return await pb.collection("clubs").getFirstListItem<ClubsResponseType>(`joinCode = "${code}" || registration = "${code}"`)
    } catch (error) {
      return null
    }
  }, [])

  return {
    isLocating,
    nearbyClubs,
    findNearbyClubs,
    findByCode,
  }
}

// Haversine formula to calculate distance in kilometers
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180)
}
