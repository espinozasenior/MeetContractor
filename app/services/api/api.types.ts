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
  conversationId: string | number
  role: "user" | "admin" | "assistant" | "system" | "data"
  content: string
  attachments?: MessageAttachment[]
  createdAt: string
  author: {
    id: string
    name: string
  }
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
  author: {
    id: string
    name: string
  }
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

/**
 * Location coordinates
 */
export interface Location {
  latitude: number
  longitude: number
}

/**
 * Request body for creating a new project
 */
export interface CreateProjectRequest {
  name: string
  description: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  location: Location
}
export interface Conversation {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  lastReadAt: string
  lastMessageAt: string
  visibility: string
}

/**
 * Response interface for creating a project
 */
export interface CreateProjectResponse {
  id: string
  ownerId: string
  name: string
  description: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  location: Location
  status: string
  createdAt: string
  updatedAt: string
  conversations: Conversation[]
}

/**
 * Upload file data structure
 */
export interface UploadFileData {
  uri: string
  type: string
  name: string
}

/**
 * Request body for uploading a single file
 */
export interface UploadFileRequest {
  file: UploadFileData
  projectId: string
  uploadedAt: string
}

/**
 * Request body for uploading multiple files
 */
export interface UploadMultipleFilesRequest {
  files: UploadFileData[]
  projectId: string
  uploadedAt: string
}

/**
 * Response interface for file upload
 */
export interface UploadResponse {
  id: string
  projectId: string
  fileName: string
  originalName: string
  mimeType: string
  size: number
  url: string
  uploadedAt: string
}

/**
 * Response interface for multiple file upload
 */
export interface UploadMultipleResponse {
  files: UploadResponse[]
  totalFiles: number
  successCount: number
  failedCount: number
}
