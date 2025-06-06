import { useState, useEffect, useCallback } from "react"
import * as Location from "expo-location"

export interface LocationData {
  latitude: number
  longitude: number
}

export interface AddressData {
  street?: string
  city?: string
  region?: string
  country?: string
  postalCode?: string
  name?: string
  formattedAddress?: string
}

export interface UseLocationReturn {
  location: LocationData | null
  address: AddressData | null
  isLoading: boolean
  error: string | null
  getCurrentLocation: () => Promise<void>
  reverseGeocode: (coords: LocationData) => Promise<void>
  requestPermissions: () => Promise<boolean>
}

export const useLocation = (): UseLocationReturn => {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [address, setAddress] = useState<AddressData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        setError("Permission to access location was denied")
        return false
      }
      return true
    } catch {
      setError("Error requesting location permissions")
      return false
    }
  }, [])

  const reverseGeocode = useCallback(async (coords: LocationData): Promise<void> => {
    try {
      const reverseGeocodedAddress = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      })

      if (reverseGeocodedAddress.length > 0) {
        const addr = reverseGeocodedAddress[0]

        // Create a formatted address
        const addressParts = []
        if (addr.streetNumber) addressParts.push(addr.streetNumber)
        if (addr.street) addressParts.push(addr.street)

        const formattedAddress =
          addressParts.length > 0
            ? addressParts.join(" ")
            : [addr.name, addr.city, addr.region].filter(Boolean).join(", ")

        setAddress({
          street: addr.street || "",
          city: addr.city || "",
          region: addr.region || "",
          country: addr.country || "",
          postalCode: addr.postalCode || "",
          name: addr.name || "",
          formattedAddress,
        })
      }
    } catch (err) {
      console.error("Reverse geocoding error:", err)
      setError("Error getting address information")
    }
  }, [])

  const getCurrentLocation = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)

      const hasPermission = await requestPermissions()
      if (!hasPermission) return

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      })

      const coords = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      }

      setLocation(coords)
      await reverseGeocode(coords)
    } catch (err) {
      setError("Error getting current location")
      console.error("Location error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [requestPermissions, reverseGeocode])

  useEffect(() => {
    getCurrentLocation()
  }, [getCurrentLocation])

  return {
    location,
    address,
    isLoading,
    error,
    getCurrentLocation,
    reverseGeocode,
    requestPermissions,
  }
}
