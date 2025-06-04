import { View, StyleSheet, StatusBar } from "react-native"
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete"
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps"
import { useNavigation } from "@react-navigation/native"
import { Icon } from "@/components"
import Constants from "expo-constants"

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
  const googleApiKey = Constants.expoConfig?.extra?.googleApiKey

  const handleBackPress = () => {
    navigation.goBack()
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* MapView as background */}
      <MapView
        style={styles.mapView}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 19.432608, // Default to Mexico City
          longitude: -99.133209,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        <Marker
          coordinate={{ latitude: 19.432608, longitude: -99.133209 }}
          pinColor={colors.success}
        />
      </MapView>

      {/* Search container with back arrow and GooglePlacesAutocomplete */}
      <View style={styles.searchContainer}>
        <Icon
          icon="back"
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
              console.log("data", data)
              console.log("details", details)
            }}
            query={{
              key: googleApiKey,
              language: "es",
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
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
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
  mapView: {
    flex: 1,
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
  textInput: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 5,
    fontSize: 16,
    height: 50,
    paddingHorizontal: 15,
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
