import { FC } from "react"
import { ViewStyle, View, Image, ImageStyle, TextStyle } from "react-native"
import { Screen, Text, Header } from "../../components"
import { AppStackScreenProps } from "@/navigators/AppNavigator"
import { useAppTheme } from "@/utils/useAppTheme"
import { useClerk } from "@clerk/clerk-expo"
import type { ThemedStyle } from "@/theme"

export interface PersonalInfoScreenProps extends AppStackScreenProps<any> {}

export const PersonalInfoScreen: FC<PersonalInfoScreenProps> = function PersonalInfoScreen({
  navigation,
}) {
  const { themed } = useAppTheme()
  const { user } = useClerk()

  return (
    <Screen preset="scroll" safeAreaEdges={["bottom"]}>
      <Header
        title="Personal Information"
        leftIcon="caretLeft"
        onLeftPress={() => navigation.goBack()}
      />

      <View style={themed($container)}>
        {/* User Info Section */}
        <View style={themed($userInfoContainer)}>
          <Image source={{ uri: user?.imageUrl }} style={themed($avatar)} />
          <Text text={user?.firstName ?? "User"} preset="subheading" style={themed($userName)} />
        </View>

        {/* Account Info Section */}
        <View style={themed($section)}>
          <Text preset="subheading" text="Account Info" style={themed($sectionTitle)} />

          <View style={themed($infoBlock)}>
            <Text preset="formLabel" text="Email Address" style={themed($label)} />
            <Text
              text={user?.primaryEmailAddress?.emailAddress || "Not provided"}
              style={themed($value)}
            />
          </View>
        </View>
        <View style={themed($divider)} />
        {/* Profile Info Section */}
        <View style={themed($section)}>
          <Text preset="subheading" text="Profile Info" style={themed($sectionTitle)} />

          <View style={themed($infoBlock)}>
            <Text preset="formLabel" text="Full name" style={themed($label)} />
            <Text
              text={`${user?.firstName || ""} ${user?.lastName || ""}`}
              style={themed($value)}
            />
          </View>

          <View style={themed($infoBlock)}>
            <Text preset="formLabel" text="Phone number" style={themed($label)} />
            <Text
              text={user?.phoneNumbers?.[0]?.phoneNumber || "Not provided"}
              style={themed($value)}
            />
          </View>
        </View>
      </View>
    </Screen>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  padding: spacing.lg,
})

const $section: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xs,
})

const $sectionTitle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $infoBlock: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xs,
})

const $label: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginBottom: spacing.xs,
})

const $value: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xs,
})

const $divider: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  height: 1,
  backgroundColor: colors.separator,
  marginVertical: spacing.sm,
})

const $avatar: ThemedStyle<ImageStyle> = ({ spacing }) => ({
  width: spacing.xxl,
  height: spacing.xxl,
  borderRadius: spacing.xxl,
})

const $userName: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginTop: spacing.xs,
})

const $userInfoContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
  marginBottom: spacing.lg,
})
