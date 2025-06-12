/**
 * This Api class lets you define an API endpoint and methods to request
 * data and process it.
 *
 * See the [Backend API Integration](https://docs.infinite.red/ignite-cli/boilerplate/app/services/#backend-api-integration)
 * documentation for more details.
 */
import { type ApiResponse, type ApisauceInstance, create } from "apisauce"
import Config from "../../config"
import type { GetToken } from "@clerk/types"
import { type GeneralApiProblem, getGeneralApiProblem } from "./apiProblem"
import type {
  ApiConfig,
  ApiFeedResponse,
  ConversationMessagesResponse,
  GetMessagesParams,
  SendMessageRequest,
  SendMessageResponse,
  MessageAttachment,
  CreateProjectRequest,
  CreateProjectResponse,
  UploadFileData,
  UploadResponse,
  UploadMultipleResponse,
  GetProjectsResponse,
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
    getToken: GetToken | undefined,
    conversationId: string,
    params?: GetMessagesParams,
  ): Promise<
    { kind: "ok"; messages: IMessage[]; hasMore: boolean; nextCursor?: string } | GeneralApiProblem
  > {
    // get the token from the clerk session
    const token = await getToken?.()
    // Prepare query parameters
    const queryParams: Record<string, string | number> = {}
    if (params?.limit) queryParams.limit = params.limit
    if (params?.cursor) queryParams.cursor = params.cursor

    // make the api call
    const response: ApiResponse<ConversationMessagesResponse> = await this.apisauce.get(
      `conversations/${conversationId}/messages`,
      queryParams,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
    console.log("response", response)
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
          text: message.content,
          createdAt: new Date(message.createdAt),
          user: {
            _id: message.author.id,
            name: message.author.name,
          },
          ...(message.attachments?.[0]?.type === "image" && {
            image: message.attachments?.[0]?.url,
          }),
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
    getToken: GetToken | undefined,
    conversationId: string,
    content: string,
    attachments?: MessageAttachment[],
    role: "user" | "admin" | "assistant" | "system" | "data" = "user",
  ): Promise<{ kind: "ok"; message: IMessage } | GeneralApiProblem> {
    // get the token from the clerk session
    const token = await getToken?.()
    // prepare the request body
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
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
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
          _id: rawData.message.author.id,
          name: rawData.message.author.name,
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

  /**
   * Creates a new project.
   */
  async createProject(
    getToken: GetToken | undefined,
    projectData: CreateProjectRequest,
  ): Promise<{ kind: "ok"; project: CreateProjectResponse } | GeneralApiProblem> {
    // get the token from the clerk session
    const token = await getToken?.()

    // make the api call
    const response: ApiResponse<CreateProjectResponse> = await this.apisauce.post(
      "projects",
      projectData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
    // the typical ways to die when calling an api
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    // transform the data into the format we are expecting
    try {
      const rawData = response.data

      if (!rawData) {
        return { kind: "bad-data" }
      }

      return { kind: "ok", project: rawData }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  /**
   * Uploads a single file to a project.
   */
  async uploadFile(
    getToken: GetToken | undefined,
    projectId: string,
    fileData: UploadFileData,
  ): Promise<{ kind: "ok"; file: UploadResponse } | GeneralApiProblem> {
    // get the token from the clerk session
    const token = await getToken?.()

    // Create FormData for multipart/form-data request
    const formData = new FormData()
    formData.append("file", {
      uri: fileData.uri,
      type: fileData.type,
      name: fileData.name,
    } as any)
    formData.append("projectId", projectId)
    formData.append("uploadedAt", new Date().toISOString())

    // make the api call
    const response: ApiResponse<UploadResponse> = await this.apisauce.post(
      `upload/${projectId}`,
      formData,
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      },
    )

    // the typical ways to die when calling an api
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    // transform the data into the format we are expecting
    try {
      const rawData = response.data

      if (!rawData) {
        return { kind: "bad-data" }
      }

      return { kind: "ok", file: rawData }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  /**
   * Uploads multiple files to a project.
   */
  async uploadMultipleFiles(
    getToken: GetToken | undefined,
    projectId: string,
    filesData: UploadFileData[],
  ): Promise<{ kind: "ok"; response: UploadMultipleResponse } | GeneralApiProblem> {
    // get the token from the clerk session
    const token = await getToken?.()

    // Create FormData for multipart/form-data request
    const formData = new FormData()

    // Add multiple files to form data
    filesData.forEach((fileData) => {
      formData.append("files", {
        uri: fileData.uri,
        type: fileData.type,
        name: fileData.name,
      } as any)
    })

    formData.append("projectId", projectId)
    formData.append("uploadedAt", new Date().toISOString())

    // make the api call
    const response: ApiResponse<UploadMultipleResponse> = await this.apisauce.post(
      `upload-multiple/${projectId}`,
      formData,
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      },
    )

    // the typical ways to die when calling an api
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    // transform the data into the format we are expecting
    try {
      const rawData = response.data

      if (!rawData) {
        return { kind: "bad-data" }
      }

      return { kind: "ok", response: rawData }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  /**
   * Gets all projects for the authenticated user.
   */
  async getProjects(
    getToken: GetToken | undefined,
  ): Promise<{ kind: "ok"; projects: GetProjectsResponse } | GeneralApiProblem> {
    // get the token from the clerk session
    const token = await getToken?.()

    // make the api call
    const response: ApiResponse<GetProjectsResponse> = await this.apisauce.get(
      "projects",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    // the typical ways to die when calling an api
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    // transform the data into the format we are expecting
    try {
      const rawData = response.data

      if (!rawData) {
        return { kind: "bad-data" }
      }

      return { kind: "ok", projects: rawData }
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
