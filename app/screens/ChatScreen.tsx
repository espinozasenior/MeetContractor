import { useCallback, useEffect, useState } from "react"
import type { ViewStyle, TextStyle } from "react-native"
import { View } from "react-native"
import { GiftedChat, Bubble } from "react-native-gifted-chat"
import type { IMessage, BubbleProps } from "react-native-gifted-chat"
import { observer } from "mobx-react-lite"
import { Header, ChatInputToolbar } from "@/components"
import type { AppStackScreenProps } from "@/navigators"
import { api } from "@/services/api"
import { useAppTheme } from "@/utils/useAppTheme"
import type { ThemedStyle } from "@/theme"
import { useSession } from "@clerk/clerk-expo"

export interface ChatScreenProps extends AppStackScreenProps<"Chat"> {}

const DEFAULT_LIMIT = 15

export const ChatScreen = observer(function ChatScreen(props: ChatScreenProps) {
  const { navigation } = props
  const { themed, theme } = useAppTheme()
  const { session } = useSession()
  const [messages, setMessages] = useState<IMessage[]>([])
  const [loadingEarlier, setLoadingEarlier] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined)
  const [inputText, setInputText] = useState("")
  const conversationId = "1" // Default conversation ID, could be passed via navigation params

  // Fetch initial messages from the API
  const fetchInitialMessages = useCallback(async () => {
    try {
      const result = await api.getConversationMessages(session?.getToken, conversationId, {
        limit: DEFAULT_LIMIT,
      })

      if (result.kind === "ok") {
        const formattedMessages = result.messages
          .map((msg) => ({
            _id: msg._id,
            text: msg.text,
            createdAt: msg.createdAt,
            user: msg.user,
            image: msg.image,
          }))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        setMessages(formattedMessages)
        setHasMore(result.hasMore)
        setNextCursor(result.nextCursor)
      } else {
        console.error("Failed to fetch messages", result)
        // Set some default messages for UI testing if API fails
        setMessages([
          {
            _id: 1,
            text: "Hello developer",
            createdAt: new Date(),
            user: {
              _id: 2,
              name: "Admin",
            },
          },
          {
            _id: 2,
            text: "This is the Chiefs theme!",
            createdAt: new Date(Date.now() - 60000),
            user: {
              _id: 1,
              name: "User",
            },
          },
        ])
        setHasMore(false)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
      // Set default messages on error
      setMessages([
        {
          _id: 1,
          text: "Hello developer (error state)",
          createdAt: new Date(),
          user: {
            _id: 2,
            name: "React Native",
          },
        },
      ])
      setHasMore(false)
    }
  }, [session?.getToken])

  // Load earlier messages (pagination)
  const loadEarlierMessages = useCallback(async () => {
    if (!hasMore || loadingEarlier || !nextCursor) return

    setLoadingEarlier(true)
    try {
      const result = await api.getConversationMessages(session?.getToken, conversationId, {
        limit: DEFAULT_LIMIT,
        cursor: nextCursor,
      })

      if (result.kind === "ok") {
        const formattedMessages = result.messages
          .map((msg) => ({
            _id: msg._id,
            text: msg.text,
            createdAt: msg.createdAt,
            user: msg.user,
            image: msg.image,
          }))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        // Prepend older messages to the existing ones
        setMessages((previousMessages) => [...previousMessages, ...formattedMessages])
        setHasMore(result.hasMore)
        setNextCursor(result.nextCursor)
      } else {
        console.error("Failed to load earlier messages", result)
      }
    } catch (error) {
      console.error("Error loading earlier messages:", error)
    } finally {
      setLoadingEarlier(false)
    }
  }, [hasMore, loadingEarlier, nextCursor, session?.getToken])

  useEffect(() => {
    fetchInitialMessages()
  }, [fetchInitialMessages])

  // Handle sending messages with our custom input
  const handleSendMessage = useCallback(async () => {
    if (inputText.trim().length === 0) return

    const newMessage: IMessage = {
      _id: Math.random().toString(36).substring(7),
      text: inputText.trim(),
      createdAt: new Date(),
      user: {
        _id: 1,
        name: "User",
      },
    }

    // Optimistically add the message to the UI
    setMessages((previousMessages) => GiftedChat.append(previousMessages, [newMessage]))

    // Clear input
    setInputText("")

    // Send message to API
    try {
      const result = await api.sendMessage(
        session?.getToken,
        conversationId,
        newMessage.text,
        undefined, // attachments (optional)
        "user", // role
      )

      if (result.kind === "ok") {
        console.log("Message sent successfully:", result.message)
        // Optionally refresh messages to get the latest state from server
        // await fetchInitialMessages()
      } else {
        console.error("Failed to send message:", result)
        // Optionally remove the optimistically added message or show error
      }
    } catch (error) {
      console.error("Error sending message:", error)
      // Optionally remove the optimistically added message or show error
    }
  }, [inputText, session?.getToken])

  // Handle attachment button press
  const handleAttachmentPress = useCallback(() => {
    console.log("Attachment button pressed")
    // Future implementation: open document picker, camera, etc.
  }, [])

  // Custom Bubble component using theme colors
  const renderBubble = useCallback(
    (bubbleProps: BubbleProps<IMessage>) => {
      return (
        <Bubble
          {...bubbleProps}
          wrapperStyle={{
            right: {
              backgroundColor: theme.colors.palette.angry500,
            },
            left: {
              backgroundColor: theme.colors.palette.neutral300,
            },
          }}
          textStyle={{
            right: {
              color: theme.colors.palette.neutral100,
            },
            left: {
              color: theme.colors.text,
            },
          }}
        />
      )
    },
    [theme.colors],
  )

  return (
    <View style={themed($container)}>
      <Header
        title="Chat"
        leftIcon="back"
        onLeftPress={() => navigation.goBack()}
        titleStyle={$headerTitle}
        style={themed($header)}
      />

      <GiftedChat
        messages={messages}
        onSend={() => {}} // We handle sending with our custom input
        user={{
          _id: 1,
          name: "User",
        }}
        renderBubble={renderBubble}
        renderInputToolbar={() => null} // Hide default input toolbar
        renderAvatarOnTop
        showAvatarForEveryMessage
        isLoadingEarlier={loadingEarlier}
        onLoadEarlier={loadEarlierMessages}
        infiniteScroll
        loadEarlier={hasMore}
      />

      {/* Our Custom Input Toolbar */}
      <ChatInputToolbar
        text={inputText}
        onTextChanged={setInputText}
        onSend={handleSendMessage}
        placeholder="Escribe un mensaje..."
        maxLength={1000}
        showAttachmentButton={true}
        showEmojiButton={true}
        onAttachmentPress={handleAttachmentPress}
      />
    </View>
  )
})

// Styles using ThemedStyle
const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $header: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
})

const $headerTitle: TextStyle = {
  // Add specific title styling if needed
}
