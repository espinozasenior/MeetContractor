/**
 * This Api class lets you define an API endpoint and methods to request
 * data and process it.
 *
 * See the [Backend API Integration](https://docs.infinite.red/ignite-cli/boilerplate/app/services/#backend-api-integration)
 * documentation for more details.
 */
import { type ApiResponse, type ApisauceInstance, create } from "apisauce"
import Config from "../../config"
import { type GeneralApiProblem, getGeneralApiProblem } from "./apiProblem"
import type {
  ApiConfig,
  ApiFeedResponse,
  ConversationMessagesResponse,
  GetMessagesParams,
  SendMessageRequest,
  SendMessageResponse,
  MessageAttachment,
} from "./api.types"
import type { EpisodeSnapshotIn } from "../../models/Episode"
import type { IMessage } from "react-native-gifted-chat"

/**
 * Configuring the apisauce instance.
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  url: Config.API_URL,
  timeout: 10000,
}

/**
 * Manages all requests to the API. You can use this class to build out
 * various requests that you need to call from your backend API.
 */
export class Api {
  apisauce: ApisauceInstance
  config: ApiConfig

  /**
   * Set up our API instance. Keep this lightweight!
   */
  constructor(config: ApiConfig = DEFAULT_API_CONFIG) {
    this.config = config
    this.apisauce = create({
      baseURL: this.config.url,
      timeout: this.config.timeout,
      headers: {
        Accept: "application/json",
      },
    })
  }

  /**
   * Gets a list of recent React Native Radio episodes.
   */
  async getEpisodes(): Promise<{ kind: "ok"; episodes: EpisodeSnapshotIn[] } | GeneralApiProblem> {
    // make the api call
    const response: ApiResponse<ApiFeedResponse> = await this.apisauce.get(
      "api.json?rss_url=https%3A%2F%2Ffeeds.simplecast.com%2FhEI_f9Dx",
    )

    // the typical ways to die when calling an api
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    // transform the data into the format we are expecting
    try {
      const rawData = response.data

      // This is where we transform the data into the shape we expect for our MST model.
      const episodes: EpisodeSnapshotIn[] =
        rawData?.items.map((raw) => ({
          ...raw,
        })) ?? []

      return { kind: "ok", episodes }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  /**
   * Gets messages for a specific conversation with pagination support.
   */
  async getConversationMessages(
    conversationId: string,
    params?: GetMessagesParams,
  ): Promise<
    { kind: "ok"; messages: IMessage[]; hasMore: boolean; nextCursor?: string } | GeneralApiProblem
  > {
    // Prepare query parameters
    const queryParams: Record<string, string | number> = {}
    if (params?.limit) queryParams.limit = params.limit
    if (params?.cursor) queryParams.cursor = params.cursor

    // make the api call
    const response: ApiResponse<ConversationMessagesResponse> = await this.apisauce.get(
      `conversations/${conversationId}/messages`,
      queryParams,
    )

    // the typical ways to die when calling an api
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    // transform the data into the format we are expecting
    try {
      const rawData = response.data

      // Transform the data into the format expected by GiftedChat
      const messages: IMessage[] =
        rawData?.messages.map((message) => ({
          _id: message.id,
          text: message.text,
          createdAt: new Date(message.createdAt),
          user: {
            _id: message.senderId,
            name: message.senderName,
            avatar: message.senderAvatar,
          },
          image: message.imageUrl,
        })) ?? []

      return {
        kind: "ok",
        messages,
        hasMore: rawData?.pagination?.hasMore ?? false,
        nextCursor: rawData?.pagination?.nextCursor,
      }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  /**
   * Sends a new message to a conversation.
   */
  async sendMessage(
    conversationId: string,
    content: string,
    attachments?: MessageAttachment[],
    role: "user" | "admin" | "assistant" | "system" | "data" = "user",
  ): Promise<{ kind: "ok"; message: IMessage } | GeneralApiProblem> {
    const requestBody: SendMessageRequest = {
      data: {
        content,
        attachments,
        role,
      },
    }

    // make the api call
    const response: ApiResponse<SendMessageResponse> = await this.apisauce.post(
      `conversations/${conversationId}/messages`,
      requestBody,
    )

    // the typical ways to die when calling an api
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    // transform the data into the format we are expecting
    try {
      const rawData = response.data

      if (!rawData?.message) {
        return { kind: "bad-data" }
      }

      // Transform the backend message format to GiftedChat IMessage format
      const message: IMessage = {
        _id: rawData.message.id,
        text: rawData.message.content || "",
        createdAt: new Date(rawData.message.createdAt),
        user: {
          _id: rawData.message.role === "user" ? 1 : 2,
          name: rawData.message.role === "user" ? "User" : "Assistant",
        },
        ...(rawData.message.attachments &&
          rawData.message.attachments.length > 0 &&
          rawData.message.attachments[0].type === "image" && {
            image: rawData.message.attachments[0].url,
          }),
      }

      return { kind: "ok", message }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }
}

// Singleton instance of the API for convenience
export const api = new Api()
