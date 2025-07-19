import { useCallback, useState, useEffect } from "react"
import type { ViewStyle, TextStyle } from "react-native"
import { View } from "react-native"
import { GiftedChat, Bubble } from "react-native-gifted-chat"
import type { IMessage, BubbleProps } from "react-native-gifted-chat"
import { observer } from "mobx-react-lite"
import { Header, ChatInputToolbar } from "@/components"
import type { AppStackScreenProps } from "@/navigators"
import { useAppTheme } from "@/utils/useAppTheme"
import type { ThemedStyle } from "@/theme"
import { useChat } from "@/hooks/useChat"
import { useConversations } from "@/hooks/useChat"

export interface ChatScreenProps extends AppStackScreenProps<"Chat"> {}

const DEFAULT_LIMIT = 15

export const ChatScreen = observer(function ChatScreen(props: ChatScreenProps) {
  const { navigation, route } = props
  const { themed, theme } = useAppTheme()
  const [inputText, setInputText] = useState("")
  const conversationId = route.params.conversationId
  const { markAsRead } = useConversations()
  console.log("conversationId", conversationId)

  // Marcar la conversación como leída al cargar la pantalla
  useEffect(() => {
    if (conversationId) {
      markAsRead(conversationId).catch((error) => {
        console.error("Error marking conversation as read:", error)
      })
    }
  }, [conversationId, markAsRead])

  // Usar el hook useChat
  const { messages, isLoading, hasMore, nextCursor, loadEarlier, sendMessage, isSending } = useChat(
    { conversationId, limit: DEFAULT_LIMIT },
  )
  console.log("messages", messages)
  // Enviar mensaje usando el hook
  const handleSendMessage = useCallback(async () => {
    if (inputText.trim().length === 0) return
    try {
      await sendMessage({ content: inputText.trim(), role: "user" })
      setInputText("")
    } catch (error) {
      // Manejo de error opcional
      console.error("Error sending message:", error)
    }
  }, [inputText, sendMessage])

  // Cargar mensajes anteriores (paginación)
  const handleLoadEarlier = useCallback(() => {
    if (hasMore && nextCursor) {
      loadEarlier(nextCursor)
    }
  }, [hasMore, nextCursor, loadEarlier])

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
        isLoadingEarlier={isLoading || isSending}
        onLoadEarlier={handleLoadEarlier}
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
