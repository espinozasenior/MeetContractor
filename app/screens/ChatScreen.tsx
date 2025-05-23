import React, { useCallback, useEffect, useState } from "react"
import { View, ViewStyle, StyleSheet, TextStyle } from "react-native"
import { GiftedChat, IMessage, Bubble, BubbleProps, InputToolbar, InputToolbarProps, Send } from "react-native-gifted-chat"
import { observer } from "mobx-react-lite"
import { Header, Icon } from "@/components"
import { AppStackScreenProps } from "@/navigators"
import { useStores } from "@/models"
import { api } from "@/services/api"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"

export interface ChatScreenProps extends AppStackScreenProps<"Chat"> {}

export const ChatScreen = observer(function ChatScreen(props: ChatScreenProps) {
  const { navigation } = props
  const { themed, theme } = useAppTheme() // Get theme object
  const [messages, setMessages] = useState<IMessage[]>([])
  const [loading, setLoading] = useState(false)
  const conversationId = "1" // Default conversation ID, could be passed via navigation params

  // Fetch messages from the API
  const fetchMessages = useCallback(async () => {
    setLoading(true)
    try {
      const result = await api.getConversationMessages(conversationId)
      if (result.kind === "ok" && result.messages) {
        // Map API messages to GiftedChat format if necessary
        // Assuming result.messages are already in IMessage format or adaptable
        const formattedMessages = result.messages.map((msg: any) => ({
          _id: msg.id || Math.random().toString(36).substring(7),
          text: msg.text,
          createdAt: new Date(msg.createdAt),
          user: {
            _id: msg.senderId === 1 ? 1 : 2, // Distinguish sender/receiver
            name: msg.senderName || (msg.senderId === 1 ? "User" : "Contractor"),
            // avatar: 'url_to_avatar' // Optional avatar
          },
        })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort messages descending
        setMessages(formattedMessages)
      } else {
        console.error("Failed to fetch messages", result)
        // Set some default messages for UI testing if API fails
        setMessages([
          {
            _id: 1,
            text: 'Hello developer',
            createdAt: new Date(),
            user: {
              _id: 2,
              name: 'Admin',
              // avatar: 'https://placeimg.com/140/140/any',
            },
          },
          {
            _id: 2,
            text: 'This is the Chiefs theme!',
            createdAt: new Date(Date.now() - 60000),
            user: {
              _id: 1,
              name: 'User',
            },
          },
        ])
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
       // Set default messages on error
       setMessages([
        {
          _id: 1,
          text: 'Hello developer (error state)',
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'React Native',
          },
        },
      ])
    } finally {
      setLoading(false)
    }
  }, [conversationId])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  const onSend = useCallback(
    (newMessages: IMessage[] = []) => {
      setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessages))
      // Send message to API logic (currently commented out)
      // try {
      //   const messageToSend = newMessages[0]
      //   await api.sendMessage(conversationId, messageToSend.text)
      //   fetchMessages()
      // } catch (error) {
      //   console.error("Error sending message:", error)
      // }
    },
    [fetchMessages, conversationId], // Added fetchMessages dependency
  )

  // Custom Bubble component using theme colors
  const renderBubble = (bubbleProps: BubbleProps<IMessage>) => {
    return (
      <Bubble
        {...bubbleProps}
        wrapperStyle={{
          right: {
            // Use theme colors - assuming chiefsRed is defined in palette
            backgroundColor: theme.colors.palette.angry500, // Example: Using angry500 for user's bubble
          },
          left: {
            backgroundColor: theme.colors.palette.neutral300, // Example: Using neutral300 for other's bubble
          },
        }}
        textStyle={{
          right: {
            color: theme.colors.palette.neutral100, // Light text on dark bubble
          },
          left: {
            color: theme.colors.text, // Default text color on light bubble
          },
        }}
      />
    )
  }

  // Custom Input Toolbar using theme colors
  const renderInputToolbar = (toolbarProps: InputToolbarProps<IMessage>) => {
    return (
      <InputToolbar
        {...toolbarProps}
        containerStyle={themed($inputToolbarContainer)}
        primaryStyle={$inputToolbarPrimary}
      />
    )
  }

  // Handle attachment button press
  const handleAttachmentPress = () => {
    // Implement attachment functionality here
    console.log('Attachment button pressed')
    // Future implementation: open document picker, camera, etc.
  }

  return (
    <View style={themed($container)}>
      <Header
        title="Chat"
        leftIcon="back"
        onLeftPress={() => navigation.goBack()}
        titleStyle={$headerTitle} // Optional: Style header title
        style={themed($header)} // Apply themed style to Header
      />
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: 1,
          name: "User",
        }}
        renderBubble={renderBubble} // Use custom bubble
        renderInputToolbar={renderInputToolbar} // Use custom input toolbar
        textInputProps={{ style: themed($textInput) }} // Apply style to make input flexible
        renderAvatarOnTop
        showAvatarForEveryMessage
        alwaysShowSend
        // Customize Send button using theme colors
        renderSend={(sendProps) => (
          <Send {...sendProps} containerStyle={$sendContainer}>
            <Icon icon="send" size={24} color={theme.colors.palette.chiefsYellow} />
          </Send>
        )}
        // Add actions to the left of the input field
        renderActions={() => (
          <View style={$attachmentContainer}>
            <Icon 
              icon="ladybug" 
              size={24} 
              color={theme.colors.palette.chiefsYellow} 
              onPress={handleAttachmentPress}
            />
          </View>
        )}
        listViewProps={{
          // contentContainerStyle: themed($chatListView), // Removed to fix type error
        }}
        isLoadingEarlier={loading}
      />
    </View>
  )
})

// Styles using ThemedStyle
const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background, // Use theme background color
})

const $header: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background, // Use theme background for header
})

const $headerTitle: TextStyle = {
  // Add specific title styling if needed, potentially using theme fonts/colors
}

const $chatListView: ThemedStyle<ViewStyle> = ({ colors }) => ({
  // Use theme background or a specific chat background color from theme
  backgroundColor: colors.background, // Or perhaps a dedicated chat background color if defined
})

const $inputToolbarContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderTopWidth: StyleSheet.hairlineWidth,
  borderTopColor: colors.separator,
  backgroundColor: colors.background,
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.xs,
})

const $inputToolbarPrimary: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1, // Allow the primary container to take up space
  flexDirection: "row",
  alignItems: "flex-end", // Align items nicely, especially with multi-line input
  paddingLeft: spacing.sm,
  paddingRight: spacing.sm,
});

const $textInput: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  flex: 1, // Make the text input expand
  backgroundColor: colors.background,
  fontFamily: typography.primary.normal,
  borderRadius: 20, // Make it rounded
  paddingHorizontal: 12,
  paddingVertical: 8, // Adjust vertical padding
  fontSize: 16,
  color: colors.text,
  // Ensure multi-line input works well
  minHeight: 40, // Set a minimum height similar to send button
  maxHeight: 120, // Optional: Limit max height
  lineHeight: 20, // Adjust line height for better text alignment
});

const $sendContainer: ViewStyle = {
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: 10,
  height: 44, // Standard touch target height
}

const $attachmentContainer: ViewStyle = {
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: 10,
  height: 44, // Standard touch target height
  marginLeft: 5,
}