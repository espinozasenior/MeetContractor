import { View, Text, ActivityIndicator, ViewStyle, TextStyle } from "react-native"
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete"
import MapView, { PROVIDER_GOOGLE, Region } from "react-native-maps"
import { useNavigation } from "@react-navigation/native"
import { Button, Icon } from "@/components"
import { useLocation } from "@/hooks"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"
import { AppStackScreenProps } from "@/navigators"
import FontAwesome5 from "@expo/vector-icons/FontAwesome5"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import Constants from "expo-constants"
import { useCallback, useRef, useState, useEffect } from "react"

export const CreateProject = () => {
  const navigation = useNavigation<AppStackScreenProps<"CreateProject">["navigation"]>()
  const mapRef = useRef<MapView>(null)
  const googleApiKey = Constants.expoConfig?.extra?.googleApiKey
  const { location, address, isLoading, reverseGeocode } = useLocation()
  const [currentRegion, setCurrentRegion] = useState<Region | null>(null)
  const { themed, theme } = useAppTheme()

  const handleBackPress = () => {
    navigation.goBack()
  }

  const handleMyLocationPress = () => {
    if (location && mapRef.current) {
      const newRegion: Region = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }
      setCurrentRegion(newRegion)
      mapRef.current.animateToRegion(newRegion, 1000)
    }
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

  const handleConfirmLocation = () => {
    if (address) {
      // Navigate to CreateProjectForm with address data
      navigation.navigate("CreateProjectForm", {
        address: {
          street: address.street,
          city: address.city,
          region: address.region,
          postalCode: address.postalCode,
          formattedAddress: address.formattedAddress,
          coordinates: {
            latitude: currentRegion?.latitude,
            longitude: currentRegion?.longitude,
          },
        },
      })
    }
  }

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
    <View style={themed($container)}>
      {/* MapView as background */}
      <MapView
        ref={mapRef}
        style={themed($mapView)}
        provider={PROVIDER_GOOGLE}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation
        showsMyLocationButton={false}
        mapType="standard"
      />

      {/* Center marker - fixed position */}
      <View style={themed($centerMarker)}>
        <FontAwesome5 name="map-marker-alt" size={40} color={theme.colors.tint} />
      </View>

      {/* Search container with back arrow and GooglePlacesAutocomplete */}
      <View style={themed($searchContainer)}>
        <Icon
          icon="x"
          size={24}
          color={theme.colors.text}
          onPress={handleBackPress}
          containerStyle={themed($backIconContainer)}
        />
        <View style={themed($autocompleteWrapper)}>
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
              textInputContainer: themed($textInputContainer),
              textInput: themed($textInput),
              listView: themed($listView),
              row: themed($row),
              description: themed($description),
            }}
            textInputProps={{
              placeholderTextColor: theme.colors.textDim,
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
          <View style={themed($searchIconContainer)}>
            <FontAwesome5 name="search" size={16} color={theme.colors.textDim} />
          </View>
        </View>
      </View>

      {/* My Location button - positioned to the left of address card */}
      <View style={themed($myLocationButton)}>
        <MaterialIcons
          name="my-location"
          size={24}
          color={theme.colors.palette.neutral100}
          onPress={handleMyLocationPress}
        />
      </View>

      {/* Address card at the bottom */}
      <View style={themed($addressCard)}>
        {isLoading ? (
          <View style={themed($loadingContainer)}>
            <ActivityIndicator size="small" color={theme.colors.tint} />
          </View>
        ) : address ? (
          <View style={themed($addressContainer)}>
            <Text style={themed($addressText)}>{address.formattedAddress}</Text>
            <Text
              style={themed($addressDetails)}
            >{`${address.city}, ${address.region}, ${address.country} ${address.postalCode}`}</Text>
            <Text style={themed($addressDetails)}>
              {currentRegion?.latitude.toFixed(6)}, {currentRegion?.longitude.toFixed(6)}
            </Text>
            <View style={themed($addressButtonContainer)}>
              <Button
                text="Cancel"
                preset="filled"
                style={themed($addressButton)}
                onPress={() => {
                  console.log("Seleccionar ubicación")
                }}
              />
              <Button
                text="Confirm"
                preset="reversed"
                style={themed($addressButton)}
                onPress={handleConfirmLocation}
              />
            </View>
          </View>
        ) : (
          <View style={themed($noAddressContainer)}>
            <Icon icon="hidden" size={20} color={theme.colors.textDim} />
            <Text style={themed($noAddressText)}>Move the map to select a location</Text>
          </View>
        )}
      </View>
    </View>
  )
}

// Themed styles using the theme system
const $container: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $mapView: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $centerMarker: ThemedStyle<ViewStyle> = () => ({
  alignItems: "center",
  justifyContent: "center",
  left: "50%",
  marginLeft: -20,
  marginTop: -40,
  position: "absolute",
  top: "50%",
  zIndex: 1,
})

const $searchContainer: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  left: 20,
  position: "absolute",
  right: 20,
  top: 60, // Position below status bar
  zIndex: 1,
})

const $backIconContainer: ThemedStyle<ViewStyle> = ({ colors, spacing: _spacing }) => ({
  alignItems: "center",
  backgroundColor: colors.palette.neutral100,
  borderRadius: 25,
  elevation: 3,
  height: 50,
  justifyContent: "center",
  shadowColor: colors.palette.neutral900,
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.1,
  shadowRadius: 3.84,
  width: 50,
})

const $autocompleteWrapper: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  marginLeft: spacing.xs + spacing.xxs,
})

const $textInputContainer: ThemedStyle<ViewStyle> = () => ({
  backgroundColor: "transparent",
  borderBottomWidth: 0,
  borderTopWidth: 0,
})

const $textInput: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderColor: colors.border,
  borderRadius: 8,
  borderWidth: 1,
  elevation: 5,
  fontSize: 16,
  height: 50,
  paddingLeft: 45, // Add padding to make room for the search icon on the left
  paddingRight: spacing.md - 1, // equivalent to 15
  shadowColor: colors.palette.neutral900,
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.1,
  shadowRadius: 3.84,
})

const $listView: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 8,
  elevation: 5,
  marginTop: 5,
  shadowColor: colors.palette.neutral900,
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.1,
  shadowRadius: 3.84,
})

const $row: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderBottomColor: colors.separator,
  borderBottomWidth: 1,
  padding: spacing.md - 1,
})

const $description: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontSize: 14,
})

const $searchIconContainer: ThemedStyle<ViewStyle> = () => ({
  alignItems: "center",
  height: 50,
  justifyContent: "center",
  position: "absolute",
  left: 15,
  top: 0,
  width: 30,
})

const $addressCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  bottom: spacing.lg + spacing.xxs, // equivalent to 20
  elevation: 5,
  left: spacing.lg + spacing.xxs, // equivalent to 20
  maxHeight: 150,
  padding: spacing.md,
  position: "absolute",
  right: spacing.lg + spacing.xxs, // equivalent to 20
  shadowColor: colors.palette.neutral900,
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.1,
  shadowRadius: 3.84,
})

const $loadingContainer: ThemedStyle<ViewStyle> = () => ({
  alignItems: "center",
  flexDirection: "row",
})

const $addressContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  flexDirection: "column",
})

const $addressText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontSize: 16,
  fontWeight: "600",
  lineHeight: 20,
})

const $addressDetails: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 14,
  marginTop: 2,
})

const $addressButtonContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.xs + spacing.xxs,
  justifyContent: "space-between",
})

const $addressButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  borderRadius: 10,
  flex: 1,
  marginTop: spacing.md - 1,
  paddingVertical: spacing.xs,
  minHeight: 40,
})

const $noAddressContainer: ThemedStyle<ViewStyle> = () => ({
  alignItems: "center",
  flexDirection: "row",
})

const $noAddressText: ThemedStyle<TextStyle> = ({ colors, spacing: _spacing }) => ({
  color: colors.textDim,
  fontSize: 14,
  marginLeft: _spacing.xs,
})

const $myLocationButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  position: "absolute",
  bottom: spacing.lg + spacing.xxs + 150 + spacing.sm, // Above the addressCard (addressCard height + margin)
  left: spacing.lg + spacing.xxs, // Same left margin as addressCard
  backgroundColor: colors.tint,
  borderRadius: 25,
  width: 40,
  height: 40,
  alignItems: "center",
  justifyContent: "center",
  elevation: 5,
  shadowColor: colors.palette.neutral900,
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.1,
  shadowRadius: 3.84,
  zIndex: 1,
})

export default CreateProject
