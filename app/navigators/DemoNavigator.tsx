import { BottomTabScreenProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { CompositeScreenProps } from "@react-navigation/native"
import { TextStyle, ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Icon } from "../components"
import { ChatListScreen, ProjectsScreen, ProfileScreen } from "../screens"
import type { ThemedStyle } from "@/theme"
import { AppStackParamList, AppStackScreenProps } from "./AppNavigator"
import { useAppTheme } from "@/utils/useAppTheme"

export type DemoTabParamList = {
  DemoCommunity: undefined
  DemoShowroom: { queryIndex?: string; itemIndex?: string }
  DemoDebug: undefined
  DemoPodcastList: undefined
  ChatList: undefined
}

/**
 * Helper for automatically generating navigation prop types for each route.
 *
 * More info: https://reactnavigation.org/docs/typescript/#organizing-types
 */
export type DemoTabScreenProps<T extends keyof DemoTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<DemoTabParamList, T>,
  AppStackScreenProps<keyof AppStackParamList>
>

const Tab = createBottomTabNavigator<DemoTabParamList>()

/**
 * This is the main navigator for the demo screens with a bottom tab bar.
 * Each tab is a stack navigator with its own set of screens.
 *
 * More info: https://reactnavigation.org/docs/bottom-tab-navigator/
 * @returns {JSX.Element} The rendered `DemoNavigator`.
 */
export function DemoNavigator() {
  const { bottom } = useSafeAreaInsets()
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: themed([{ height: bottom + 60 }]),
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tintInactive,
        tabBarLabelStyle: themed($tabBarLabel),
        tabBarItemStyle: themed($tabBarItem),
      }}
    >
      <Tab.Screen
        name="DemoShowroom"
        component={ProjectsScreen}
        options={{
          tabBarLabel: "Projects",
          tabBarIcon: ({ focused }) => (
            <Icon
              icon={focused ? "home2" : "home"}
              color={focused ? colors.tint : colors.tintInactive}
              size={30}
            />
          ),
        }}
      />

      <Tab.Screen
        name="ChatList"
        component={ChatListScreen} // Use placeholder component
        options={{
          tabBarLabel: "Chats",
          tabBarIcon: ({ focused }) => (
            <Icon
              icon={focused ? "message2" : "message"}
              color={focused ? colors.tint : colors.tintInactive}
              size={30}
            />
          ),
          tabBarAccessibilityLabel: "Chat",
        }}
      />

      <Tab.Screen
        name="DemoDebug"
        component={ProfileScreen}
        options={{
          tabBarAccessibilityLabel: "Profile",
          tabBarLabel: "Profile",
          tabBarIcon: ({ focused }) => (
            <Icon
              icon={focused ? "userSquare2" : "userSquare"}
              color={focused ? colors.tint : colors.tintInactive}
              size={30}
            />
          ),
        }}
      />
    </Tab.Navigator>
  )
}

const $tabBarItem: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingTop: spacing.md,
})

const $tabBarLabel: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontSize: 12,
  fontFamily: typography.primary.medium,
  lineHeight: 16,
})
