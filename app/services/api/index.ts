// Exportar la clase base
// Crear instancias singleton de los servicios para mantener compatibilidad
import { ChatService } from "./chatService"
import { ProjectService } from "./projectService"
import { FileService } from "./fileService"

export { BaseApi, DEFAULT_API_CONFIG } from "./baseApi"

// Exportar tipos y utilidades
export * from "./api.types"
export * from "./apiProblem"

// Instancias singleton
export const chatService = new ChatService()
export const projectService = new ProjectService()
export const fileService = new FileService()

// Exportar una API unificada para mantener compatibilidad con el código existente
export class Api {
  chat = chatService
  project = projectService
  file = fileService
}

// Instancia singleton de la API unificada
export const api = new Api()
