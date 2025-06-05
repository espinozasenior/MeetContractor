import { View, StyleSheet, StatusBar, Text, ActivityIndicator } from "react-native"
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete"
import MapView, { PROVIDER_GOOGLE, Region } from "react-native-maps"
import { useNavigation } from "@react-navigation/native"
import { Button, Icon } from "@/components"
import { useLocation } from "@/hooks"
import FontAwesome5 from "@expo/vector-icons/FontAwesome5"
import Constants from "expo-constants"
import { useCallback, useRef, useState, useEffect } from "react"

const colors = {
  background: "#f5f5f5",
  white: "#fff",
  text: "#333",
  textSecondary: "#666",
  border: "#ddd",
  borderLight: "#f0f0f0",
  success: "#4CAF50",
  successLight: "#e8f5e8",
  successDark: "#2E7D32",
  successMedium: "#388E3C",
  shadow: "#000",
  placeholder: "#999",
  transparent: "transparent",
}

export const CreateProject = () => {
  const navigation = useNavigation()
  const mapRef = useRef<MapView>(null)
  const googleApiKey = Constants.expoConfig?.extra?.googleApiKey
  const { location, address, isLoading, reverseGeocode } = useLocation()
  const [currentRegion, setCurrentRegion] = useState<Region | null>(null)

  const handleBackPress = () => {
    navigation.goBack()
  }

  const handleRegionChangeComplete = useCallback(
    async (region: Region) => {
      setCurrentRegion(region)
      // Reverse geocode the center coordinates
      await reverseGeocode({
        latitude: region.latitude,
        longitude: region.longitude,
      })
    },
    [reverseGeocode],
  )

  // Update map region when user location is available
  useEffect(() => {
    if (location && mapRef.current) {
      const newRegion: Region = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }
      setCurrentRegion(newRegion)
      // Animate to user's location
      mapRef.current.animateToRegion(newRegion, 1000)
    }
  }, [location])

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* MapView as background */}
      <MapView
        ref={mapRef}
        style={styles.mapView}
        provider={PROVIDER_GOOGLE}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation
        showsMyLocationButton={false}
        mapType="standard"
      />

      {/* Center marker - fixed position */}
      <View style={styles.centerMarker}>
        <FontAwesome5 name="map-marker-alt" size={40} color={colors.success} />
      </View>

      {/* Search container with back arrow and GooglePlacesAutocomplete */}
      <View style={styles.searchContainer}>
        <Icon
          icon="x"
          size={24}
          color={colors.text}
          onPress={handleBackPress}
          containerStyle={styles.backIconContainer}
        />
        <View style={styles.autocompleteWrapper}>
          <GooglePlacesAutocomplete
            predefinedPlaces={[]}
            placeholder="Buscar ubicación..."
            onPress={(data, details) => {
              if (details?.geometry?.location) {
                const newRegion = {
                  latitude: details.geometry.location.lat,
                  longitude: details.geometry.location.lng,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }
                mapRef.current?.animateToRegion(newRegion, 1000)
              }
            }}
            query={{
              key: googleApiKey,
              language: "en",
            }}
            fetchDetails={true}
            enablePoweredByContainer={false}
            styles={{
              textInputContainer: styles.textInputContainer,
              textInput: styles.textInput,
              listView: styles.listView,
              row: styles.row,
              description: styles.description,
            }}
            textInputProps={{
              placeholderTextColor: colors.placeholder,
            }}
            debounce={300}
            minLength={2}
            nearbyPlacesAPI="GooglePlacesSearch"
            GooglePlacesSearchQuery={{
              rankby: "distance",
            }}
            filterReverseGeocodingByTypes={["locality", "administrative_area_level_3"]}
          />
          {/* Search icon positioned inside the input */}
          <View style={styles.searchIconContainer}>
            <FontAwesome5 name="search" size={16} color={colors.placeholder} />
          </View>
        </View>
      </View>

      {/* Address card at the bottom */}
      <View style={styles.addressCard}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.success} />
            <Text style={styles.loadingText}>Obteniendo ubicación...</Text>
          </View>
        ) : address ? (
          <View style={styles.addressContainer}>
            <Text style={styles.addressText}>{address.formattedAddress}</Text>
            <Text
              style={styles.addressDetails}
            >{`${address.city}, ${address.region}, ${address.country} ${address.postalCode}`}</Text>
            <Text style={styles.addressDetails}>
              {currentRegion?.latitude.toFixed(6)}, {currentRegion?.longitude.toFixed(6)}
            </Text>
            <View style={styles.addressButtonContainer}>
              <Button
                text="Cancel"
                preset="filled"
                style={styles.addressButton}
                onPress={() => {
                  console.log("Seleccionar ubicación")
                }}
              />
              <Button
                text="Confirm"
                preset="reversed"
                style={styles.addressButton}
                onPress={() => {
                  console.log("Seleccionar ubicación")
                }}
              />
            </View>
          </View>
        ) : (
          <View style={styles.noAddressContainer}>
            <Icon icon="hidden" size={20} color={colors.textSecondary} />
            <Text style={styles.noAddressText}>Mueve el mapa para seleccionar una ubicación</Text>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  addressButton: {
    borderRadius: 15,
    flex: 1,
    marginTop: 15,
  },
  addressButtonContainer: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },

  addressCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    bottom: 20,
    elevation: 5,
    left: 20,
    maxHeight: 150,
    padding: 16,
    position: "absolute",
    right: 20,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  addressContainer: {
    flex: 1,
    flexDirection: "column",
  },
  addressDetails: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  addressText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
  },
  autocompleteWrapper: {
    flex: 1,
    marginLeft: 10,
  },
  backIconContainer: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 25,
    elevation: 3,
    height: 50,
    justifyContent: "center",
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    width: 50,
  },
  centerMarker: {
    alignItems: "center",
    justifyContent: "center",
    left: "50%",
    marginLeft: -20,
    marginTop: -40,
    position: "absolute",
    top: "50%",
    zIndex: 1,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  description: {
    color: colors.text,
    fontSize: 14,
  },
  listView: {
    backgroundColor: colors.white,
    borderRadius: 8,
    elevation: 5,
    marginTop: 5,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  loadingContainer: {
    alignItems: "center",
    flexDirection: "row",
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginLeft: 8,
  },
  mapView: {
    flex: 1,
  },
  noAddressContainer: {
    alignItems: "center",
    flexDirection: "row",
  },
  noAddressText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginLeft: 8,
  },
  row: {
    backgroundColor: colors.white,
    borderBottomColor: colors.borderLight,
    borderBottomWidth: 1,
    padding: 15,
  },
  searchContainer: {
    flexDirection: "row",
    left: 20,
    position: "absolute",
    right: 20,
    top: 60, // Position below status bar
    zIndex: 1,
  },
  searchIconContainer: {
    alignItems: "center",
    height: 50,
    justifyContent: "center",
    position: "absolute",
    right: 15,
    top: 0,
    width: 30,
  },
  textInput: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 5,
    fontSize: 16,
    height: 50,
    paddingHorizontal: 15,
    paddingRight: 45, // Add padding to make room for the search icon
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  textInputContainer: {
    backgroundColor: colors.transparent,
    borderBottomWidth: 0,
    borderTopWidth: 0,
  },
})

export default CreateProject
