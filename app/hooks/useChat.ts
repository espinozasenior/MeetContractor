import { useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { chatService } from "@/services/api"

import type { MessageAttachment } from "@/services/api/api.types"
import { useAuth } from "@clerk/clerk-expo"

const CHAT_MESSAGES_QUERY_KEY = "chatMessages"

export interface UseChatOptions {
  conversationId: string
  limit?: number
}

export const useChat = ({ conversationId, limit = 15 }: UseChatOptions) => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  // Query para obtener mensajes (paginado)
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: [CHAT_MESSAGES_QUERY_KEY, conversationId, limit],
    queryFn: async () => {
      const response = await chatService.getConversationMessages(getToken, conversationId, {
        limit,
      })
      if (response.kind === "ok") {
        return {
          messages: response.messages,
          hasMore: response.hasMore,
          nextCursor: response.nextCursor,
        }
      } else {
        throw new Error("Failed to fetch chat messages")
      }
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })

  // Mutación para enviar mensaje
  const sendMessageMutation = useMutation({
    mutationFn: async ({
      content,
      attachments,
      role,
    }: {
      content: string
      attachments?: MessageAttachment[]
      role?: "user" | "admin" | "assistant" | "system" | "data"
    }) => {
      const response = await chatService.sendMessage(
        getToken,
        conversationId,
        content,
        attachments,
        role,
      )
      if (response.kind === "ok") {
        return response.message
      } else {
        throw new Error("Failed to send message")
      }
    },
    onSuccess: async () => {
      // Refrescar mensajes después de enviar
      await queryClient.invalidateQueries({
        queryKey: [CHAT_MESSAGES_QUERY_KEY, conversationId, limit],
      })
    },
  })

  // Función para cargar más mensajes (paginación)
  const loadEarlier = useCallback(
    async (nextCursor?: string) => {
      if (!nextCursor) return
      const response = await chatService.getConversationMessages(getToken, conversationId, {
        limit,
        cursor: nextCursor,
      })
      if (response.kind === "ok") {
        // Prepend nuevos mensajes a los existentes en caché
        queryClient.setQueryData(
          [CHAT_MESSAGES_QUERY_KEY, conversationId, limit],
          (oldData: any) => {
            return {
              messages: [...(oldData?.messages || []), ...response.messages],
              hasMore: response.hasMore,
              nextCursor: response.nextCursor,
            }
          },
        )
      }
    },
    [getToken, conversationId, limit, queryClient],
  )

  return {
    messages: data?.messages || [],
    isLoading,
    isFetching,
    error: error ? (error as Error).message : null,
    hasMore: data?.hasMore ?? false,
    nextCursor: data?.nextCursor,
    refetch,
    loadEarlier,
    sendMessage: sendMessageMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,
  }
}

export const useConversations = () => {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await chatService.getConversations(getToken)
      if (response.kind === "ok") {
        return response.chats
      } else {
        throw new Error("Failed to fetch conversations")
      }
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })

  // Mutación para marcar una conversación como leída
  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      const response = await chatService.markConversationAsRead(getToken, conversationId)
      if (response.kind !== "ok") {
        throw new Error("Failed to mark conversation as read")
      }
      return conversationId
    },
    onSuccess: () => {
      // Invalidar la cache de conversaciones para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ["conversations"] })
    },
  })

  return {
    data,
    isLoading,
    error,
    markAsRead: markAsReadMutation.mutateAsync,
    isMarkingAsRead: markAsReadMutation.isPending,
  }
}
