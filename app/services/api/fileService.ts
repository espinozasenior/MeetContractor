import { type ApiResponse } from "apisauce"
import type { GetToken } from "@clerk/types"
import { type GeneralApiProblem, getGeneralApiProblem } from "./apiProblem"
import { BaseApi } from "./baseApi"
import type { UploadFileData, UploadResponse, UploadMultipleResponse } from "./api.types"

/**
 * Servicio para manejar todas las operaciones relacionadas con archivos
 */
export class FileService extends BaseApi {
  /**
   * Sube un archivo único a un proyecto
   */
  async uploadFile(
    getToken: GetToken | undefined,
    projectId: string,
    fileData: UploadFileData,
  ): Promise<{ kind: "ok"; file: UploadResponse } | GeneralApiProblem> {
    // obtener el token de la sesión de clerk
    const token = await getToken?.()

    // Crear FormData para la petición multipart/form-data
    const formData = new FormData()
    formData.append("file", {
      uri: fileData.uri,
      type: fileData.type,
      name: fileData.name,
    } as any)
    formData.append("projectId", projectId)
    formData.append("uploadedAt", new Date().toISOString())

    // realizar la llamada a la API
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

    // verificar errores en la respuesta
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    // transformar los datos al formato esperado
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
   * Sube múltiples archivos a un proyecto
   */
  async uploadMultipleFiles(
    getToken: GetToken | undefined,
    projectId: string,
    filesData: UploadFileData[],
  ): Promise<{ kind: "ok"; response: UploadMultipleResponse } | GeneralApiProblem> {
    // obtener el token de la sesión de clerk
    const token = await getToken?.()

    // Crear FormData para la petición multipart/form-data
    const formData = new FormData()

    // Agregar múltiples archivos al form data
    filesData.forEach((fileData) => {
      formData.append("files", {
        uri: fileData.uri,
        type: fileData.type,
        name: fileData.name,
      } as any)
    })

    formData.append("projectId", projectId)
    formData.append("uploadedAt", new Date().toISOString())

    // realizar la llamada a la API
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

    // verificar errores en la respuesta
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    // transformar los datos al formato esperado
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
   * Obtiene la lista de archivos de un proyecto
   */
  async getProjectFiles(
    getToken: GetToken | undefined,
    projectId: string,
  ): Promise<{ kind: "ok"; files: UploadResponse[] } | GeneralApiProblem> {
    // obtener el token de la sesión de clerk
    const token = await getToken?.()

    // realizar la llamada a la API
    const response: ApiResponse<{ files: UploadResponse[] }> = await this.apisauce.get(
      `projects/${projectId}/files`,
      {},
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

      if (!rawData) {
        return { kind: "bad-data" }
      }

      return { kind: "ok", files: rawData.files }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  /**
   * Elimina un archivo específico
   */
  async deleteFile(
    getToken: GetToken | undefined,
    projectId: string,
    fileId: string,
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    // obtener el token de la sesión de clerk
    const token = await getToken?.()

    // realizar la llamada a la API
    const response: ApiResponse<void> = await this.apisauce.delete(
      `projects/${projectId}/files/${fileId}`,
      {},
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

    return { kind: "ok" }
  }

  /**
   * Helper method to get success message for uploads
   */
  getSuccessMessage(fileCount: number): string {
    const fileText = fileCount === 1 ? "file" : "files"
    return `${fileCount} ${fileText} uploaded successfully`
  }

  /**
   * Helper method to get error message for uploads
   */
  getErrorMessage(error?: string): string {
    return error || "Failed to upload files"
  }
}
