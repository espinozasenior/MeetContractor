import { View, Text, Pressable, ActivityIndicator } from "react-native"
import { useConversations } from "@/hooks/useChat"
import { ListView } from "@/components/ListView"
import { Screen } from "@/components"
import { useAppTheme } from "@/utils/useAppTheme"
import { colors, type ThemedStyle } from "@/theme"
import type { ViewStyle, TextStyle } from "react-native"
import { DemoTabScreenProps } from "@/navigators/DemoNavigator"
import { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { useHeader } from "@/utils/useHeader"

type TabType = "all" | "read" | "unread"

export const ChatListScreen: FC<DemoTabScreenProps<"ChatList">> = observer(
  function ChatListScreen(_props) {
    const { navigation } = _props
    const { data: conversations, isLoading, error } = useConversations()
    const { themed } = useAppTheme()
    const [selectedTab, setSelectedTab] = useState<TabType>("all")

    useHeader({
      title: "Chats",
      titleStyle: {
        fontSize: 20,
        fontWeight: "bold",
        color: colors.text,
      },
      safeAreaEdges: ["top"],
    })

    if (isLoading)
      return (
        <View style={themed($loadingContainer)}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      )
    if (error)
      return (
        <Screen preset="fixed" contentContainerStyle={themed($containerError)}>
          <Text>Error loading conversations: {error.message}</Text>
        </Screen>
      )

    // Filter conversations based on selected tab
    const filteredConversations = conversations?.filter((conversation) => {
      if (selectedTab === "all") return true
      if (selectedTab === "read") return !conversation.hasUnreadMessages
      if (selectedTab === "unread") return conversation.hasUnreadMessages
      return true
    })

    return (
      <Screen preset="fixed" contentContainerStyle={themed($container)}>
        {/* Tab Navigation */}
        <View style={themed($tabContainer)}>
          <Pressable
            style={[$tabButton, selectedTab === "all" && themed($activeTabButton)]}
            onPress={() => setSelectedTab("all")}
          >
            <Text style={[themed($tabText), selectedTab === "all" && themed($activeTabText)]}>
              All
            </Text>
          </Pressable>
          <Pressable
            style={[$tabButton, selectedTab === "read" && themed($activeTabButton)]}
            onPress={() => setSelectedTab("read")}
          >
            <Text style={[themed($tabText), selectedTab === "read" && themed($activeTabText)]}>
              Read
            </Text>
          </Pressable>
          <Pressable
            style={[$tabButton, selectedTab === "unread" && themed($activeTabButton)]}
            onPress={() => setSelectedTab("unread")}
          >
            <Text style={[themed($tabText), selectedTab === "unread" && themed($activeTabText)]}>
              Unread
            </Text>
          </Pressable>
          <View style={themed($tabIndicator)} />
        </View>

        <ListView
          data={filteredConversations}
          estimatedItemSize={80}
          contentContainerStyle={themed($contentContainer)}
          keyExtractor={(item) => item.conversationId}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate("Chat", { conversationId: item.conversationId })}
              style={themed($chatItem)}
            >
              <Text
                style={themed($chatTitle)}
              >{`${item.lastMessageAuthor || "Author"} • ${item.projectName}`}</Text>
              <Text style={themed($chatPreview)}>{item.lastMessage}</Text>
              <Text style={themed($chatDate)}>
                {item.lastMessageTimestamp
                  ? new Date(item.lastMessageTimestamp).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : ""}
              </Text>
            </Pressable>
          )}
        />
      </Screen>
    )
  },
)

// Styles
const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $tabContainer: ThemedStyle<ViewStyle> = (_) => ({
  flexDirection: "row",
  paddingHorizontal: 24,
  marginBottom: 16,
  position: "relative",
  paddingBottom: 10,
  paddingTop: 10,
  justifyContent: "flex-start",
})

const $tabButton: ViewStyle = {
  marginRight: 16,
  alignItems: "center",
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 8,
  minWidth: 80,
  justifyContent: "center",
}

const $tabText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontSize: 15,
  fontFamily: typography.primary.medium,
  color: colors.palette.neutral600,
  textAlign: "center",
})

const $activeTabText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
  fontWeight: "600",
})

const $activeTabButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.tint,
  borderRadius: 8,
  elevation: 1,
  shadowColor: colors.tint,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.2,
  shadowRadius: 2,
})

const $tabIndicator: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  bottom: 0,
  left: 24,
  right: 24,
  height: 1,
  backgroundColor: colors.palette.neutral300,
})

const $contentContainer: ThemedStyle<ViewStyle> = () => ({
  paddingHorizontal: 24,
})

const $chatItem: ThemedStyle<ViewStyle> = ({ colors }) => ({
  paddingVertical: 16,
  borderBottomWidth: 0.5,
  borderBottomColor: colors.palette.neutral300,
})

const $chatTitle: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.medium,
  color: colors.palette.neutral900,
})

const $chatPreview: ThemedStyle<TextStyle> = ({ typography }) => ({
  color: colors.palette.neutral900,
  fontSize: 16,
  fontFamily: typography.primary.normal,
})

const $chatDate: ThemedStyle<TextStyle> = ({ typography }) => ({
  color: colors.palette.neutral400,
  fontSize: 14,
  fontFamily: typography.primary.normal,
})

const $loadingContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: colors.background,
})

const $containerError: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: colors.background,
})
