import { type ApiResponse } from "apisauce"
import type { GetToken } from "@clerk/types"
import { type GeneralApiProblem, getGeneralApiProblem } from "./apiProblem"
import { BaseApi } from "./baseApi"
import type {
  ConversationMessagesResponse,
  GetMessagesParams,
  SendMessageRequest,
  SendMessageResponse,
  MessageAttachment,
} from "./api.types"
import type { IMessage } from "react-native-gifted-chat"

/**
 * Servicio para manejar todas las operaciones relacionadas con el chat
 */
export class ChatService extends BaseApi {
  /**
   * Obtiene mensajes de una conversación específica con soporte de paginación
   */
  async getConversationMessages(
    getToken: GetToken | undefined,
    conversationId: string,
    params?: GetMessagesParams,
  ): Promise<
    { kind: "ok"; messages: IMessage[]; hasMore: boolean; nextCursor?: string } | GeneralApiProblem
  > {
    // obtener el token de la sesión de clerk
    const token = await getToken?.()

    // Preparar parámetros de consulta
    const queryParams: Record<string, string | number> = {}
    if (params?.limit) queryParams.limit = params.limit
    if (params?.cursor) queryParams.cursor = params.cursor

    // realizar la llamada a la API
    const response: ApiResponse<ConversationMessagesResponse> = await this.apisauce.get(
      `conversations/${conversationId}/messages`,
      queryParams,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    // verificar errores en la respuesta
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    // transformar los datos al formato esperado
    try {
      const rawData = response.data

      // Transformar los datos al formato esperado por GiftedChat
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
   * Envía un nuevo mensaje a una conversación
   */
  async sendMessage(
    getToken: GetToken | undefined,
    conversationId: string,
    content: string,
    attachments?: MessageAttachment[],
    role: "user" | "admin" | "assistant" | "system" | "data" = "user",
  ): Promise<{ kind: "ok"; message: IMessage } | GeneralApiProblem> {
    // obtener el token de la sesión de clerk
    const token = await getToken?.()

    // preparar el cuerpo de la petición
    const requestBody: SendMessageRequest = {
      data: {
        content,
        attachments,
        role,
      },
    }

    // realizar la llamada a la API
    const response: ApiResponse<SendMessageResponse> = await this.apisauce.post(
      `conversations/${conversationId}/messages`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    // verificar errores en la respuesta
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    // transformar los datos al formato esperado
    try {
      const rawData = response.data

      if (!rawData?.message) {
        return { kind: "bad-data" }
      }

      // Transformar el formato de mensaje del backend al formato IMessage de GiftedChat
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
}
