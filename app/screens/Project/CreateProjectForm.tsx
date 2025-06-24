import { useState } from "react"
import { View, Text, TextInput, ScrollView, ViewStyle, TextStyle, Alert } from "react-native"
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native"
import { useAuth } from "@clerk/clerk-expo"
import { Button, Screen } from "@/components"
import { useAppTheme } from "@/utils/useAppTheme"
import { useHeader } from "@/utils/useHeader"
import { ThemedStyle } from "@/theme"
import { AppStackParamList, AppStackScreenProps } from "@/navigators"
import { api } from "@/services/api"

type CreateProjectFormRouteProp = RouteProp<AppStackParamList, "CreateProjectForm">

interface ProjectFormData {
  projectName: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  formattedAddress: string
  coordinates: {
    latitude?: number
    longitude?: number
  }
}

// Component for input with floating label
const FloatingLabelInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  style,
  containerStyle,
}: {
  label: string
  value: string
  onChangeText: (text: string) => void
  placeholder: string
  keyboardType?: "default" | "numeric"
  style?: any
  containerStyle?: any
}) => {
  const { themed, theme } = useAppTheme()

  return (
    <View style={[themed($inputGroup), containerStyle]}>
      {value.length > 0 && <Text style={themed($floatingLabel)}>{label}</Text>}
      <TextInput
        style={[themed($input), style]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textDim}
        keyboardType={keyboardType}
      />
    </View>
  )
}

export const CreateProjectForm = () => {
  const navigation = useNavigation<AppStackScreenProps<"CreateProjectForm">["navigation"]>()
  const route = useRoute<CreateProjectFormRouteProp>()
  const { themed, theme } = useAppTheme()
  const { getToken } = useAuth()
  const [isCreating, setIsCreating] = useState(false)

  // Get address data from navigation params
  const { address } = route.params || {}

  const [formData, setFormData] = useState<ProjectFormData>({
    projectName: "",
    addressLine1: address?.street || "",
    addressLine2: "",
    city: address?.city || "",
    state: address?.region || "",
    postalCode: address?.postalCode || "",
    formattedAddress: address?.formattedAddress || "",
    coordinates: address?.coordinates || {
      latitude: undefined,
      longitude: undefined,
    },
  })

  const handleBackPress = () => {
    navigation.goBack()
  }

  const handleInputChange = (field: keyof ProjectFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCreateProject = async () => {
    if (!isFormValid() || isCreating) return

    setIsCreating(true)

    try {
      const projectData = {
        name: formData.projectName.trim(),
        description: "", // Could add a description field later
        addressLine1: formData.formattedAddress || formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city.trim(),
        state: formData.state.trim(),
        postalCode: formData.postalCode.trim(),
        location: {
          latitude: formData.coordinates.latitude || 0,
          longitude: formData.coordinates.longitude || 0,
        },
      }

      const result = await api.createProject(getToken, projectData)

      if (result.kind === "ok") {
        console.log("Project created:", result.project)
        // Navigate to success screen with project details
        navigation.navigate("ProjectSuccess", {
          projectId: result.project.id,
          projectName: formData.projectName.trim(),
          address: `${formData.city}, ${formData.state} ${formData.postalCode}`,
        })
      } else {
        // Handle API error

        console.log("Error creating project:", result)
        Alert.alert("Error", "No se pudo crear el proyecto. Por favor, intenta de nuevo.", [
          { text: "OK" },
        ])
      }
    } catch (error) {
      console.error("Error creating project:", error)
      Alert.alert("Error", "Ocurrió un error inesperado. Por favor, intenta de nuevo.", [
        { text: "OK" },
      ])
    } finally {
      setIsCreating(false)
    }
  }

  const isFormValid = () => {
    return (
      formData.projectName.trim() !== "" &&
      formData.city.trim() !== "" &&
      formData.state.trim() !== ""
    )
  }

  // Configure header using useHeader hook
  useHeader(
    {
      title: "Create Project",
      leftIcon: "back",
      onLeftPress: handleBackPress,
      rightText: isCreating ? "Creating..." : "Create",
      onRightPress: handleCreateProject,
      backgroundColor: theme.colors.background,
    },
    [isFormValid(), isCreating],
  )

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={themed($container)}>
      <ScrollView
        style={themed($scrollView)}
        contentContainerStyle={themed($scrollContent)}
        showsVerticalScrollIndicator={false}
      >
        {/* Project Name */}
        <FloatingLabelInput
          label="Project name"
          value={formData.projectName}
          onChangeText={(value) => handleInputChange("projectName", value)}
          placeholder="Project name"
        />

        {/* Address Line 1 */}
        <FloatingLabelInput
          label="Address Line 1"
          value={formData.formattedAddress}
          onChangeText={(value) => handleInputChange("addressLine1", value)}
          placeholder="Address Line 1"
        />

        {/* Address Line 2 */}
        <FloatingLabelInput
          label="Address Line 2"
          value={formData.addressLine2}
          onChangeText={(value) => handleInputChange("addressLine2", value)}
          placeholder="Address Line 2"
        />

        {/* City, State, Postal Code Row */}
        <View style={themed($rowContainer)}>
          <FloatingLabelInput
            label="City"
            value={formData.city}
            onChangeText={(value) => handleInputChange("city", value)}
            placeholder="Ciudad Guayana"
            containerStyle={themed($thirdColumnContainer)}
          />

          <FloatingLabelInput
            label="State"
            value={formData.state}
            onChangeText={(value) => handleInputChange("state", value)}
            placeholder="Bolívar"
            containerStyle={themed($thirdColumnContainer)}
          />

          <FloatingLabelInput
            label="Postal Code"
            value={formData.postalCode}
            onChangeText={(value) => handleInputChange("postalCode", value)}
            placeholder="8050"
            keyboardType="numeric"
            containerStyle={themed($thirdColumnContainer)}
          />
        </View>
      </ScrollView>

      {/* Bottom Create Button */}
      <View style={themed($bottomButtonContainer)}>
        <Button
          text={isCreating ? "Creating..." : "Create"}
          preset="filled"
          style={themed($createButton)}
          textStyle={themed($createButtonText)}
          onPress={handleCreateProject}
          disabled={!isFormValid() || isCreating}
        />
      </View>
    </Screen>
  )
}

// Styled components
const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $keyboardContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $scrollView: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $scrollContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.lg,
})

const $inputGroup: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

// Floating label that appears when input has content
const $floatingLabel: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 14,
  color: colors.textDim,
  marginBottom: spacing.xs,
  fontWeight: "400",
})

const $input: ThemedStyle<ViewStyle> = ({ colors, spacing, typography }) => ({
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
  paddingVertical: spacing.sm,
  paddingHorizontal: 0,
  fontSize: 18,

  color: colors.text,
  fontFamily: typography.primary.normal,
  fontWeight: "500",
})

const $rowContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.md,
  width: "100%",
})

const $thirdColumnContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  width: "33.333%",
})

const $bottomButtonContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.lg,
})

const $createButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.tint,
  borderRadius: 12,
  minHeight: 50,
})

const $createButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
  fontSize: 18,
  fontWeight: "600",
})

export default CreateProjectForm
