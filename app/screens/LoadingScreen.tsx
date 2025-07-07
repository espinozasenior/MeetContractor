import { View, ViewStyle, ActivityIndicator } from "react-native"
import { Screen } from "@/components"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"

export const LoadingScreen = () => {
  const { themed, theme } = useAppTheme()

  return (
    <Screen preset="fixed" contentContainerStyle={themed($container)}>
      <View style={themed($content)}>
        <ActivityIndicator size="large" color={theme.colors.tint} />
      </View>
    </Screen>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
  justifyContent: "center",
  alignItems: "center",
})

const $content: ThemedStyle<ViewStyle> = () => ({
  alignItems: "center",
  gap: 16,
})
