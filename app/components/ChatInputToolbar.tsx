import { useCallback, useState } from "react"
import type { ReactElement } from "react"
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Keyboard,
  Alert,
} from "react-native"
import type { ViewStyle, TextStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { Icon } from "@/components"
import { useAppTheme } from "@/utils/useAppTheme"
import type { ThemedStyle } from "@/theme"

export interface ChatInputToolbarProps {
  text: string
  onTextChanged: (text: string) => void
  onSend: () => void
  placeholder?: string
  multiline?: boolean
  disabled?: boolean
  maxLength?: number
  showAttachmentButton?: boolean
  showEmojiButton?: boolean
  onAttachmentPress?: () => void
  onEmojiPress?: () => void
}

export const ChatInputToolbar = observer(function ChatInputToolbar(
  props: ChatInputToolbarProps,
): ReactElement {
  const {
    text,
    onTextChanged,
    onSend,
    placeholder = "Escribe un mensaje...",
    multiline = true,
    disabled = false,
    maxLength = 1000,
    showAttachmentButton = true,
    onAttachmentPress,
  } = props

  const { themed, theme } = useAppTheme()
  const [isFocused, setIsFocused] = useState(false)
  const [inputHeight, setInputHeight] = useState(20)

  const canSend = text.trim().length > 0 && !disabled

  const handleSend = useCallback(() => {
    if (canSend) {
      onSend()
      Keyboard.dismiss()
    }
  }, [canSend, onSend])

  const handleAttachment = useCallback(() => {
    if (onAttachmentPress) {
      onAttachmentPress()
    } else {
      Alert.alert("Adjuntar archivo", "Selecciona el tipo de archivo", [
        { text: "Cámara", onPress: () => console.log("Camera pressed") },
        { text: "Galería", onPress: () => console.log("Gallery pressed") },
        { text: "Documento", onPress: () => console.log("Document pressed") },
        { text: "Cancelar", style: "cancel" },
      ])
    }
  }, [onAttachmentPress])

  const handleContentSizeChange = useCallback(
    (event: { nativeEvent: { contentSize: { height: number } } }) => {
      const { height } = event.nativeEvent.contentSize
      const newHeight = Math.max(40, Math.min(120, height + 20))
      setInputHeight(newHeight)
    },
    [],
  )

  return (
    <View style={themed($container)}>
      {/* Main Input Row */}
      <View style={themed($inputRow)}>
        {/* Attachment Button */}
        {showAttachmentButton && (
          <TouchableOpacity
            style={themed($actionButton)}
            onPress={handleAttachment}
            disabled={disabled}
            activeOpacity={0.7}
          >
            <Icon
              icon="ladybug"
              size={24}
              color={disabled ? theme.colors.textDim : theme.colors.tint}
            />
          </TouchableOpacity>
        )}

        {/* Text Input Container */}
        <View style={[themed($inputContainer), isFocused && themed($inputContainerFocused)]}>
          <TextInput
            style={[
              themed($textInput),
              { height: inputHeight },
              disabled && themed($textInputDisabled),
            ]}
            value={text}
            onChangeText={onTextChanged}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.textDim}
            multiline={multiline}
            maxLength={maxLength}
            editable={!disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onContentSizeChange={handleContentSizeChange}
            textAlignVertical="top"
            returnKeyType="default"
            blurOnSubmit={false}
          />

          {/* Character Counter */}
          {text.length > maxLength * 0.8 && (
            <View style={themed($characterCounter)}>
              <Icon
                icon="bell"
                size={12}
                color={text.length >= maxLength ? theme.colors.error : theme.colors.textDim}
              />
            </View>
          )}
        </View>

        {/* Right Actions */}
        <View style={themed($rightActions)}>
          {/* Send Button */}
          <TouchableOpacity
            style={[
              themed($sendButton),
              canSend && themed($sendButtonActive),
              !canSend && themed($sendButtonDisabled),
            ]}
            onPress={handleSend}
            disabled={!canSend}
            activeOpacity={0.8}
          >
            <Icon
              icon="send"
              size={20}
              color={canSend ? theme.colors.palette.neutral100 : theme.colors.textDim}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Character Count Display */}
      {text.length > maxLength * 0.9 && (
        <View style={themed($footer)}>
          <View style={themed($characterCountContainer)}>
            <Icon
              icon="bell"
              size={14}
              color={text.length >= maxLength ? theme.colors.error : theme.colors.textDim}
            />
            <View style={themed($characterCountText)}>{/* You can add text here if needed */}</View>
          </View>
        </View>
      )}
    </View>
  )
})

// Themed Styles
const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  borderTopWidth: StyleSheet.hairlineWidth,
  borderTopColor: colors.separator,
  ...Platform.select({
    ios: {
      paddingBottom: spacing.md,
    },
    android: {
      paddingBottom: spacing.sm,
    },
  }),
})

const $inputRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "flex-end",
  gap: spacing.xs,
})

const $actionButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: 44,
  height: 44,
  borderRadius: 22,
  justifyContent: "center",
  alignItems: "center",
  marginBottom: spacing.xxs,
})

const $inputContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flex: 1,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 20,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xs,
  minHeight: 40,
  maxHeight: 120,
  justifyContent: "center",
  position: "relative",
  ...Platform.select({
    ios: {
      shadowColor: colors.palette.neutral500,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
  }),
})

const $inputContainerFocused: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderWidth: 1,
  borderColor: colors.tint,
  backgroundColor: colors.background,
})

const $textInput: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 16,
  lineHeight: 20,
  color: colors.text,

  textAlignVertical: "center",
})

const $textInputDisabled: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  backgroundColor: colors.palette.neutral100,
})

const $characterCounter: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  top: 4,
  right: 4,
  width: 16,
  height: 16,
  borderRadius: 8,
  justifyContent: "center",
  alignItems: "center",
})

const $rightActions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "flex-end",
  gap: spacing.xxs,
})

const $sendButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: 44,
  height: 44,
  borderRadius: 22,
  justifyContent: "center",
  alignItems: "center",
  marginBottom: spacing.xxs,
  backgroundColor: colors.palette.neutral300,
  ...Platform.select({
    ios: {
      shadowColor: colors.palette.neutral500,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    android: {
      elevation: 3,
    },
  }),
})

const $sendButtonActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.tint,
  transform: [{ scale: 1.05 }],
})

const $sendButtonDisabled: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral200,
  opacity: 0.6,
})

const $footer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingTop: spacing.xs,
  paddingHorizontal: spacing.sm,
})

const $characterCountContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: spacing.xxs,
})

const $characterCountText: ThemedStyle<ViewStyle> = () => ({
  // Placeholder for character count text if needed
})
