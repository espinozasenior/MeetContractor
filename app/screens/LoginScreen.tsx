import * as React from "react"
import { observer } from "mobx-react-lite"
import { FC, useEffect, useState } from "react"
import { ViewStyle, TextStyle } from "react-native"
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
  const { navigation } = _props

  const handleSSOSignIn = async (strategy: OAuthStrategy) => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy,
      })
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId })
        setAuthToken(createdSessionId)
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
  }, [isLoaded, isSignedIn, setAuthToken])

  return (
    <Screen
      preset="auto"
      contentContainerStyle={themed($screenContentContainer)}
      safeAreaEdges={["top", "bottom"]}
    >
      <SignedIn>
        <Text tx="loginScreen:alreadySignedIn" preset="heading" style={themed($logIn)} />
      </SignedIn>
      <SignedOut>
        {!isLoaded ? (
          <Text tx="loginScreen:loading" preset="subheading" style={themed($enterDetails)} />
        ) : (
          <>
            <Screen preset="auto" style={themed($authContainer)}>
              <Button
                text="Continue with Google"
                preset="filled"
                style={themed($socialButton)}
                onPress={() => handleSSOSignIn('oauth_google')}
              />
              <Button
                text="Continue with GitHub"
                preset="filled"
                style={themed($socialButton)}
                onPress={() => handleSSOSignIn('oauth_github')}
              />
              <Button
                text="Continue with Apple"
                preset="filled"
                style={themed($socialButton)}
                onPress={() => handleSSOSignIn('oauth_apple')}
              />
            </Screen>

            <Text
              tx={isSignIn ? "loginScreen:noAccount" : "loginScreen:haveAccount"}
              style={themed($hint)}
              onPress={() => setIsSignIn(!isSignIn)}
            />
          </>
        )}
      </SignedOut>
    </Screen>
  )
})

const $screenContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.xxl,
  paddingHorizontal: spacing.lg,
})

const $logIn: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
})

const $enterDetails: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $hint: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.tint,
  marginBottom: spacing.md,
})

const $textField: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $tapButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xs,
})

const $authContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  gap: spacing.md,
})

const $socialButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  borderColor: colors.tint,
  borderWidth: 1,
})
