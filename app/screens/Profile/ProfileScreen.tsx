import { FC } from "react"
import { Image, ViewStyle, TouchableOpacity } from "react-native"
import { Screen, Text, ListItem, Icon } from "../../components"
import { DemoTabScreenProps } from "../../navigators/DemoNavigator"
import { useAppTheme } from "@/utils/useAppTheme"
import { useStores } from "@/models"
import { useClerk } from "@clerk/clerk-expo"
import type { ThemedStyle } from "@/theme"
import { UserResource } from "@clerk/types"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { AppStackParamList } from "../../navigators/AppNavigator"

export const ProfileScreen: FC<DemoTabScreenProps<"DemoDebug">> = function ProfileScreen(_props) {
  const { theme, themed } = useAppTheme()
  const { user, signOut } = useClerk()
  const {
    authenticationStore: { logout },
  } = useStores()
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>()

  const handleLogout = () => {
    logout(signOut)
  }

  return (
    <Screen
      preset="scroll"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($contentContainer)}
    >
      {/* Profile header with avatar and name */}
      <ProfileHeader user={user} />

      {/* Account Settings Section */}
      <Text preset="subheading" text="Account Settings" style={themed($sectionTitle)} />

      {/* Menu Items */}
      <ListItem
        leftIcon="userSquare"
        text="Personal information"
        rightIcon="caretRight"
        topSeparator
        onPress={() => navigation.navigate("PersonalInfo")}
      />

      <ListItem
        leftIcon="bell"
        text="Notifications"
        rightIcon="caretRight"
        topSeparator
        onPress={() => console.log("Notifications pressed")}
      />

      <ListItem
        leftIcon="lock"
        text="Privacy and sharing"
        rightIcon="caretRight"
        topSeparator
        bottomSeparator
        onPress={() => console.log("Privacy and sharing pressed")}
      />

      {/* Logout Button */}
      <TouchableOpacity style={themed($logoutButton)} onPress={handleLogout}>
        <Icon icon="logout" size={20} color={theme.colors.palette.angry500} />
        <Text text="Logout" style={themed($logoutText)} />
      </TouchableOpacity>
    </Screen>
  )
}

// Profile Header Component with Avatar and Name
const ProfileHeader: FC<{ user: UserResource | null | undefined }> = ({ user }) => {
  const { themed } = useAppTheme()

  return (
    <TouchableOpacity style={themed($profileHeaderContainer)}>
      {/* Avatar */}
      <Image source={{ uri: user?.imageUrl }} style={themed($avatar)} />
      <Text text={user?.firstName ?? "User"} preset="subheading" style={themed($userName)} />
    </TouchableOpacity>
  )
}

const $contentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.xl,
  paddingHorizontal: spacing.lg,
})

const $sectionTitle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.lg,
  marginBottom: spacing.md,
})

const $profileHeaderContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  paddingVertical: spacing.xl,
})

const $avatar: ThemedStyle<any> = ({ spacing }) => ({
  width: 80,
  height: 80,
  borderRadius: 40,
  marginBottom: spacing.md,
})

const $userName: ThemedStyle<ViewStyle> = () => ({
  marginBottom: 4,
})

const $logoutButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  marginTop: spacing.xl,
  paddingVertical: spacing.md,
})

const $logoutText: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginLeft: spacing.sm,
  color: colors.palette.angry500,
  fontWeight: "500",
})
