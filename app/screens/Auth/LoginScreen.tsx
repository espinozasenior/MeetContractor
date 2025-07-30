import * as React from "react"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { ViewStyle, TextStyle, Image, View, ImageStyle } from "react-native"
import { Screen, Text, Button } from "@/components"
import { AppStackScreenProps } from "@/navigators"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import AppLogo from "../../../assets/images/app-logo.svg"
import { useAuth, SignedIn, SignedOut, useSSO } from "@clerk/clerk-expo"
import type { OAuthStrategy } from "@clerk/types"
// import { useStores } from "@/models"

interface LoginScreenProps extends AppStackScreenProps<"Login"> {}

export const LoginScreen: FC<LoginScreenProps> = observer(function LoginScreen(_props) {
  const { themed } = useAppTheme()
  const { isLoaded, isSignedIn } = useAuth()
  const { startSSOFlow } = useSSO()

  const handleSSOSignIn = async (strategy: OAuthStrategy) => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy,
      })
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId })
        // Consider if setting the token here is necessary if Clerk handles session
        // setAuthToken(createdSessionId) // Potentially redundant if Clerk manages auth state
        // const token = await getToken()
        // setAuthToken(token || undefined)
      }
    } catch (err) {
      console.error("OAuth error:", err)
    }
  }

  return (
    <Screen
      preset="fixed"
      contentContainerStyle={themed($screenContentContainer)}
      safeAreaEdges={["top", "bottom"]}
      style={themed($screen)}
    >
      <View style={themed($logoContainer)}>
        <AppLogo />
        <Text text="Meet Contractor" preset="subheading" style={themed($logoText)} />
        <Text
          text="We’re going to build your dreams together and closer to you."
          preset="subheading"
          style={themed($description)}
        />
      </View>

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
                preset="default"
                LeftAccessory={() => (
                  <Image
                    source={require("../../../assets/images/google-logo.png")}
                    style={themed($googleLogo)}
                  />
                )}
                onPress={() => handleSSOSignIn("oauth_google")}
              />
              <Button
                text="Continue with Apple"
                preset="filled"
                style={themed($appleButton)}
                textStyle={themed($appleButtonText)}
                LeftAccessory={() => (
                  <Image
                    source={require("../../../assets/images/apple-logo.png")}
                    style={themed($appleLogo)}
                  />
                )}
                onPress={() => handleSSOSignIn("oauth_apple")}
              />

              {/* Main Login Button */}
              <Button
                text="Log In"
                style={themed($tapButton)}
                textStyle={themed($tapButtonText)}
                preset="filled"
                onPress={() => {
                  /* TODO: Implement actual login logic or navigation */
                }}
              />

              {/* Create Account Text */}
              <Text
                tx={isSignedIn ? "loginScreen:noAccount" : "loginScreen:haveAccount"}
                style={themed($hint)}
                onPress={() => {}}
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

const $logoContainer: ThemedStyle<ViewStyle> = () => ({
  alignItems: "center",
  // Removed marginBottom, rely on space-between in container
})

const $logoText: ThemedStyle<TextStyle> = ({ typography, spacing, colors }) => ({
  fontFamily: typography.primary.bold,
  fontSize: 24,
  color: colors.palette.neutral900,
  marginTop: spacing.xl,
})

const $description: ThemedStyle<TextStyle> = ({ typography, spacing, colors }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 16,
  textAlign: "center",
  color: colors.palette.neutral900,
  marginTop: spacing.xs,
  maxWidth: 320,
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

const $googleLogo: ThemedStyle<ImageStyle> = () => ({
  width: 20,
  height: 20,
  marginRight: 10,
  resizeMode: "contain",
})

// This style seems unused in the current component logic
// const $textField: ThemedStyle<ViewStyle> = ({ spacing }) => ({
//   marginBottom: spacing.lg,
// })

const $tapButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.palette.chiefsYellow,
  borderRadius: spacing.sm,
})

// Style for the main button text
const $tapButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text, // Use theme's default text color for contrast
})

const $appleButton: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#000",
  borderRadius: 12,
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
