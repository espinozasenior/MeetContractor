import { View, Text, ViewStyle, TextStyle, Image, ImageStyle } from "react-native"
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native"
import { Button, Screen } from "@/components"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"
import { AppStackParamList } from "@/navigators"

type ProjectSuccessRouteProp = RouteProp<AppStackParamList, "ProjectSuccess">

export const ProjectSuccess = () => {
  const navigation = useNavigation()
  const route = useRoute<ProjectSuccessRouteProp>()
  const { themed } = useAppTheme()

  // Get project data from navigation params
  const { projectName, address } = route.params || {}

  const handleTakePhotos = () => {
    // TODO: Navigate to photo capture screen
    console.log("Take Photos pressed")
  }

  const handleUploadPhotos = () => {
    // TODO: Navigate to photo upload screen
    console.log("Upload Photos pressed")
  }

  const handleOpenProject = () => {
    navigation.navigate("Welcome" as never)
  }

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={themed($container)}>
      <Text style={themed($doneText)}>Done</Text>

      {/* Success Icon */}
      <View style={themed($iconContainer)}>
        <Image source={require("../../assets/images/download-file.png")} style={themed($icon)} />
      </View>

      {/* Project Details */}
      <View style={themed($detailsContainer)}>
        <Text style={themed($projectTitle)}>{projectName || "C. Aro"}</Text>
        <Text style={themed($projectAddress)}>{address || "Ciudad Guayana, Bolívar 8050"}</Text>
      </View>

      {/* Action Buttons */}
      <View style={themed($buttonsContainer)}>
        <Button
          text="Take Photos"
          preset="filled"
          style={themed($takePhotosButton)}
          textStyle={themed($takePhotosButtonText)}
          onPress={handleTakePhotos}
        />

        <Button
          text="Upload Photos"
          preset="default"
          style={themed($uploadPhotosButton)}
          textStyle={themed($uploadPhotosButtonText)}
          onPress={handleUploadPhotos}
        />

        <Button
          text="Open Project"
          preset="default"
          style={themed($openProjectButton)}
          textStyle={themed($openProjectButtonText)}
          onPress={handleOpenProject}
        />
      </View>
    </Screen>
  )
}

// Styled components
const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
  paddingHorizontal: 24,
  justifyContent: "center",
  alignItems: "center",
})

const $doneText: ThemedStyle<TextStyle> = ({ colors }) => ({
  position: "absolute",
  top: 60,
  right: 24,
  color: colors.tint,
  fontSize: 16,
  fontWeight: "500",
})

const $iconContainer: ThemedStyle<ViewStyle> = () => ({
  marginBottom: 40,
  alignItems: "center",
  justifyContent: "center",
})

const $detailsContainer: ThemedStyle<ViewStyle> = () => ({
  alignItems: "center",
  marginBottom: 60,
})

const $projectTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 24,
  fontWeight: "bold",
  color: colors.text,
  marginBottom: 8,
})

const $projectAddress: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  color: colors.textDim,
  textAlign: "center",
})

const $buttonsContainer: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
  gap: 16,
})

const $takePhotosButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.tint,
  borderRadius: 12,
  minHeight: 50,
})

const $takePhotosButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
  fontSize: 16,
  fontWeight: "600",
})

const $uploadPhotosButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral300,
  borderRadius: 12,
  minHeight: 50,
})

const $uploadPhotosButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontSize: 16,
  fontWeight: "500",
})

const $openProjectButton: ThemedStyle<ViewStyle> = () => ({
  backgroundColor: "transparent",
  borderRadius: 12,
  minHeight: 50,
})

const $openProjectButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.tint,
  fontSize: 16,
  fontWeight: "500",
})

const $icon: ThemedStyle<ImageStyle> = () => ({
  width: 120,
  height: 120,
})

export default ProjectSuccess
