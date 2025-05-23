import * as React from "react"
import { observer } from "mobx-react-lite"
import { FC, useEffect, useState } from "react"
import { ViewStyle, TextStyle, Image, View, ImageStyle, ImageBackground } from "react-native"
import { Screen, Text, Button } from "../components"
import { AppStackScreenProps } from "../navigators"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { useAuth, SignedIn, SignedOut, useSSO } from "@clerk/clerk-expo"
import type { OAuthStrategy } from "@clerk/types"
import { useStores } from "@/models"

interface LoginScreenProps extends AppStackScreenProps<"Login"> {}

export const LoginScreen: FC<LoginScreenProps> = observer(function LoginScreen(_props) {
  const { themed } = useAppTheme()
  const { isLoaded, isSignedIn, getToken } = useAuth()
  const { startSSOFlow } = useSSO()
  const [isSignIn, setIsSignIn] = useState(true)
  const {
    authenticationStore: { setAuthToken },
  } = useStores()
  // const { navigation } = _props // navigation is not used

  const handleSSOSignIn = async (strategy: OAuthStrategy) => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy,
      })
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId })
        // Consider if setting the token here is necessary if Clerk handles session
        // setAuthToken(createdSessionId) // Potentially redundant if Clerk manages auth state
        const token = await getToken()
        setAuthToken(token || undefined)
      }
    } catch (err) {
      console.error("OAuth error:", err)
    }
  }

  useEffect(() => {
    const fetchAndSetToken = async () => {
      if (isLoaded && isSignedIn) {
        const token = await getToken()
        setAuthToken(token || undefined)
      }
    }
    fetchAndSetToken()
    // Dependency array is correct
  }, [isLoaded, isSignedIn, getToken, setAuthToken]) // Added getToken to dependencies

  return (
    <Screen
      preset="fixed"
      contentContainerStyle={themed($screenContentContainer)}
      safeAreaEdges={["top", "bottom"]}
      style={themed($screen)}
    >
      <View style={themed($logoContainer)}>
        <Image source={require("../../assets/images/logo.png")} style={themed($logo)} />
        <Text text="Meet Contractor" preset="subheading" style={themed($logoText)} />
      </View>

      <ImageBackground
        source={require("../../assets/images/demo/rnr-image-1.png")} // Placeholder graphic
        style={themed($backgroundGraphic)}
        resizeMode="contain"
      >
        {/* Ensures ImageBackground takes space and allows content overlay if needed */}
        <View style={{ flex: 1 }} />
      </ImageBackground>

      <View style={themed($bottomContainer)}>
        <SignedIn>
          <Text tx="loginScreen:alreadySignedIn" preset="heading" style={themed($logIn)} />
          {/* Optionally add a sign out button here */}
        </SignedIn>
        <SignedOut>
          {!isLoaded ? (
            <Text tx="loginScreen:loading" preset="subheading" style={themed($enterDetails)} />
          ) : (
            <>
              {/* Social Login Buttons */}
              <Button
                text="Continue with Google"
                preset="filled"
                onPress={() => handleSSOSignIn('oauth_google')}
              />
              <View style={themed($appleButtonContainer)}>
                <View style={themed($appleButton)}>
                  <Image
                    source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' }}
                    style={themed($appleLogo)}
                  />
                  <Text style={themed($appleButtonText)} text="Sign in with Apple" />
                </View>
              </View>
              {/* Main Login Button */}
              <Button
                text="Log In"
                style={themed($tapButton)}
                textStyle={themed($tapButtonText)}
                preset="filled"
                onPress={() => { /* TODO: Implement actual login logic or navigation */ }}
              />

              {/* Create Account Text */}
              <Text
                tx={isSignIn ? "loginScreen:noAccount" : "loginScreen:haveAccount"}
                style={themed($hint)}
                onPress={() => setIsSignIn(!isSignIn) /* Or navigate to Create Account screen */}
              />
            </>
          )}
        </SignedOut>
      </View>
    </Screen>
  )
})

// Styles
const $screen: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background, // Use theme background
})

const $screenContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1, // Make content container fill the screen
  justifyContent: "space-between", // Pushes elements to top and bottom
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xxl, // More padding at the bottom
  paddingTop: (spacing.xxl || 0) * 2, // Cast/default spacing.xxl before multiplying
})

const $logoContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  // Removed marginBottom, rely on space-between in container
})

const $logo: ThemedStyle<ImageStyle> = () => ({
  width: 60, // Slightly smaller logo
  height: 60,
  resizeMode: "contain",
})

const $logoText: ThemedStyle<TextStyle> = ({ typography, spacing, colors }) => ({
  fontFamily: typography.primary.bold,
  fontSize: 24,
  color: colors.palette.chiefsYellow,
  marginTop: spacing.xs,
})

const $backgroundGraphic: ThemedStyle<ImageStyle> = ({ spacing }) => ({
  position: "absolute",
  bottom: 200, // Adjust position relative to bottom container
  left: spacing.lg,
  right: spacing.lg,
  height: 200, // Adjust height
  opacity: 0.15, // Make it subtle
  zIndex: -1, // Ensure it's behind other elements
})

const $bottomContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg, // Keep horizontal padding consistent
  gap: spacing.md, // Spacing between buttons/text
  paddingBottom: spacing.xl, // Add some padding within the bottom container
})

const $logIn: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
  textAlign: "center",
})

const $enterDetails: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
  textAlign: "center",
})

const $hint: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text, // Use default text color for better visibility
  textAlign: "center",
  marginTop: spacing.md,
  marginBottom: spacing.md,
})

// This style seems unused in the current component logic
// const $textField: ThemedStyle<ViewStyle> = ({ spacing }) => ({
//   marginBottom: spacing.lg,
// })

const $tapButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.md,
  backgroundColor: colors.palette.chiefsYellow,
  borderRadius: spacing.sm,
})

// Style for the main button text
const $tapButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text, // Use theme's default text color for contrast
})

const $appleButtonContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
  marginBottom: spacing.md,
  alignItems: "center",
})

const $appleButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#000",
  borderRadius: 6,
  height: 44,
  paddingHorizontal: 16,
  width: "100%",
  maxWidth: 400,
})

const $appleLogo: ThemedStyle<ImageStyle> = () => ({
  width: 20,
  height: 20,
  marginRight: 10,
  resizeMode: "contain",
  tintColor: "#fff",
})

const $appleButtonText: ThemedStyle<TextStyle> = () => ({
  color: "#fff",
  fontSize: 16,
  fontWeight: "600",
  fontFamily: "System",
})
