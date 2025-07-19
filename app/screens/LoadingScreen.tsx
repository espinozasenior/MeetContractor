import { ViewStyle, Animated, Easing } from "react-native"
import { Screen } from "@/components"
import { useAppTheme } from "@/utils/useAppTheme"
import AppLogo from "../../assets/images/app-logo.svg"
import { ThemedStyle } from "@/theme"
import { useEffect, useRef } from "react"

export const LoadingScreen = () => {
  const { themed } = useAppTheme()
  const scale = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 2000,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start()
  }, [scale])

  return (
    <Screen preset="fixed" contentContainerStyle={themed($container)}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <AppLogo />
      </Animated.View>
    </Screen>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.palette.primary500,
  justifyContent: "center",
  alignItems: "center",
})
