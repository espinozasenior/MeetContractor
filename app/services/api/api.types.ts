/**
 * These types indicate the shape of the data you expect to receive from your
 * API endpoint, assuming it's a JSON object like we have.
 */
export interface EpisodeItem {
  title: string
  pubDate: string
  link: string
  guid: string
  author: string
  thumbnail: string
  description: string
  content: string
  enclosure: {
    link: string
    type: string
    length: number
    duration: number
    rating: { scheme: string; value: string }
  }
  categories: string[]
}

export interface ApiFeedResponse {
  status: string
  feed: {
    url: string
    title: string
    link: string
    author: string
    description: string
    image: string
  }
  items: EpisodeItem[]
}

/**
 * Message interface for chat conversations
 */
export interface Message {
  id: string | number
  text: string
  createdAt: string
  senderId: string | number
  senderName: string
  senderAvatar?: string
  imageUrl?: string
}

/**
 * Response interface for conversation messages
 */
export interface ConversationMessagesResponse {
  messages: Message[]
  pagination?: {
    hasMore: boolean
    nextCursor?: string
    totalCount?: number
  }
}

/**
 * Parameters for getting conversation messages with pagination
 */
export interface GetMessagesParams {
  limit?: number
  cursor?: string
}

/**
 * Attachment structure for messages
 */
export interface MessageAttachment {
  type: "image" | "file" | "audio" | "video"
  url: string
  name?: string
  size?: number
  mimeType?: string
}

/**
 * Request body for sending a new message
 */
export interface SendMessageRequest {
  data: {
    content: string
    attachments?: MessageAttachment[]
    role: "user" | "admin" | "assistant" | "system" | "data"
  }
}

/**
 * Backend message structure from API response
 */
export interface ResponseMessage {
  id: string
  conversationId: string
  role: "user" | "admin" | "assistant" | "system" | "data"
  content: string | null
  attachments?: MessageAttachment[]
  createdAt: string
}

/**
 * Response interface for sending a message
 */
export interface SendMessageResponse {
  message: ResponseMessage
}

/**
 * The options used to configure apisauce.
 */
export interface ApiConfig {
  /**
   * The URL of the api.
   */
  url: string

  /**
   * Milliseconds before we timeout the request.
   */
  timeout: number
}
