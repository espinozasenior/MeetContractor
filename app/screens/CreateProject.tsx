import { useState } from "react"
import { View, Text, StyleSheet, SafeAreaView, Alert, ScrollView } from "react-native"
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete"

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
  const handlePlaceSelect = (data: any, details: any = null) => {
    console.log("Selected place data:", data)
    console.log("Selected place details:", details)

    // Show alert with the selected place
    Alert.alert(
      "Lugar seleccionado",
      `${data.description}\n\nLat: ${details?.geometry?.location?.lat}\nLng: ${details?.geometry?.location?.lng}`,
      [{ text: "OK" }],
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Crear Proyecto</Text>
        <Text style={styles.subtitle}>Selecciona una ubicación</Text>

        <View style={styles.autocompleteContainer}>
          <GooglePlacesAutocomplete
            placeholder="Buscar ubicación..."
            onPress={handlePlaceSelect}
            query={{
              key: "AIzaSyDNwCzfNFsRRBJA4BnnHU35B8SMlwwbwW0",
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
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  autocompleteContainer: {
    marginBottom: 20,
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
  row: {
    backgroundColor: colors.white,
    borderBottomColor: colors.borderLight,
    borderBottomWidth: 1,
    padding: 15,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
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
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
})

export default CreateProject
