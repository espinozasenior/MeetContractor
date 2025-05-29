import { observer } from "mobx-react-lite"
import type { FC } from "react"
import { Image, type ImageStyle, type TextStyle, View, type ViewStyle } from "react-native"
import { Button, Text, Screen } from "@/components"
import { isRTL } from "@/i18n"
import { useStores } from "../models"
import type { AppStackScreenProps } from "../navigators"
import { $styles, type ThemedStyle } from "@/theme"
import { useHeader } from "../utils/useHeader"
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"
import { useAppTheme } from "@/utils/useAppTheme"
import { useClerk } from "@clerk/clerk-expo"

const welcomeLogo = require("../../assets/images/logo.png")
const welcomeFace = require("../../assets/images/welcome-face.png")

interface WelcomeScreenProps extends AppStackScreenProps<"Welcome"> {}

export const WelcomeScreen: FC<WelcomeScreenProps> = observer(function WelcomeScreen(_props) {
  const { themed, theme } = useAppTheme()
  const { signOut } = useClerk()
  const { navigation } = _props
  const {
    authenticationStore: { logout },
    projectStore: { hasProjects, addProject },
  } = useStores()

  function goNext() {
    navigation.navigate("Demo", { screen: "DemoShowroom", params: {} })
  }

  function handleStartFirstProject() {
    // Create a sample project to demonstrate the flow
    // In a real app, this would navigate to a project creation form
    const sampleProject = {
      id: Date.now().toString(),
      name: "East High School",
      address: "3287 Elmwood Drive",
    }

    addProject(sampleProject)

    // Navigate to the main app flow
    navigation.navigate("Demo", { screen: "DemoShowroom", params: {} })
  }

  // Remove the useCallback handler

  useHeader(
    {
      rightIcon: "settings",
      backgroundColor: "#fff",
      rightIconColor: "#FFB81C",
      // Call the updated async logout action, passing signOut
      onRightPress: () => {
        console.log("WelcomeScreen: onRightPress called")
        // Call the async logout action from the store, passing the signOut function
        logout(signOut).catch((error) => {
          // Optional: Handle any errors from the logout flow itself
          console.error("WelcomeScreen: Error during logout flow execution:", error)
        })
      },
    },
    [logout, signOut], // Depend directly on logout and signOut
  )

  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])

  // Show "Create Your First Project" content if user has no projects
  if (hasProjects) {
    return (
      <Screen preset="fixed" contentContainerStyle={themed($createProjectContainer)}>
        <View style={themed($createProjectContent)}>
          {/* Header Text */}
          <View style={themed($headerContainer)}>
            <Text
              style={themed($headerText)}
              preset="heading"
              tx="welcomeScreen:organizationHeading"
            />
            <View style={themed($underline)} />
          </View>

          {/* Address Block */}
          <View style={themed($addressContainer)}>
            <Text style={themed($projectName)} preset="formLabel" tx="welcomeScreen:projectName" />
            <Text
              style={themed($projectAddress)}
              preset="formLabel"
              tx="welcomeScreen:projectAddress"
            />
          </View>

          {/* Button */}
          <View style={themed($buttonContainer)}>
            <Button
              testID="start-first-project-button"
              style={themed($createProjectButton)}
              textStyle={themed($createProjectButtonText)}
              pressedStyle={themed($createProjectButtonPressed)}
              onPress={handleStartFirstProject}
              tx="welcomeScreen:startFirstProject"
            />
          </View>
        </View>
      </Screen>
    )
  }

  // Show original welcome content if user has projects
  return (
    <Screen preset="fixed" contentContainerStyle={$styles.flex1}>
      <View style={themed($topContainer)}>
        <Image style={themed($welcomeLogo)} source={welcomeLogo} resizeMode="contain" />
        <Text
          testID="welcome-heading"
          style={themed($welcomeHeading)}
          tx="welcomeScreen:readyForLaunch"
          preset="heading"
        />
        <Text tx="welcomeScreen:exciting" preset="subheading" />
        <Image
          style={$welcomeFace}
          source={welcomeFace}
          resizeMode="contain"
          tintColor={theme.isDark ? theme.colors.palette.neutral900 : undefined}
        />
      </View>

      <View style={themed([$bottomContainer, $bottomContainerInsets])}>
        <Text tx="welcomeScreen:postscript" size="md" />

        <Button
          testID="next-screen-button"
          preset="reversed"
          tx="welcomeScreen:letsGo"
          onPress={goNext}
        />
      </View>
    </Screen>
  )
})

// Original WelcomeScreen styles
const $topContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexShrink: 1,
  flexGrow: 1,
  flexBasis: "57%",
  justifyContent: "center",
  paddingHorizontal: spacing.lg,
})

const $bottomContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexShrink: 1,
  flexGrow: 0,
  flexBasis: "43%",
  backgroundColor: colors.palette.neutral100,
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  paddingHorizontal: spacing.lg,
  justifyContent: "space-around",
})

const $welcomeLogo: ThemedStyle<ImageStyle> = ({ spacing }) => ({
  height: 88,
  width: "100%",
  marginBottom: spacing.xxl,
})

const $welcomeFace: ImageStyle = {
  height: 169,
  width: 269,
  position: "absolute",
  bottom: -47,
  right: -80,
  transform: [{ scaleX: isRTL ? -1 : 1 }],
}

const $welcomeHeading: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

// Create Your First Project styles
const $createProjectContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  backgroundColor: "#FFFFFF",
})

const $createProjectContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: spacing.lg,
})

const $headerContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  marginBottom: spacing.xl,
})

const $headerText: ThemedStyle<TextStyle> = () => ({
  fontSize: 24,
  fontWeight: "bold",
  color: "#E31837",
  textAlign: "center",
  marginBottom: 8,
})

const $underline: ThemedStyle<ViewStyle> = () => ({
  width: "80%",
  height: 2,
  backgroundColor: "#FFB81C",
})

const $addressContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  marginBottom: spacing.xxl,
})

const $projectName: ThemedStyle<TextStyle> = ({ spacing }) => ({
  fontSize: 18,
  fontWeight: "bold",
  color: "#333333",
  marginBottom: spacing.xs,
})

const $projectAddress: ThemedStyle<TextStyle> = () => ({
  fontSize: 16,
  color: "#333333",
})

const $buttonContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  marginTop: spacing.xxl,
  position: "relative",
})

const $createProjectButton: ThemedStyle<ViewStyle> = () => ({
  backgroundColor: "#E31837",
  borderRadius: 8,
  paddingVertical: 12,
  paddingHorizontal: 24,
  shadowColor: "#000000",
  shadowOffset: { width: 2, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 4,
})

const $createProjectButtonText: ThemedStyle<TextStyle> = () => ({
  color: "#FFFFFF",
  fontSize: 18,
  fontWeight: "bold",
})

const $createProjectButtonPressed: ThemedStyle<ViewStyle> = () => ({
  backgroundColor: "#E31837",
})
