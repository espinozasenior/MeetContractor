import { api } from "@/services/api"
import type { GetToken } from "@clerk/types"
import type {
  UploadFileData,
  UploadResponse,
  UploadMultipleResponse,
} from "@/services/api/api.types"

export interface UploadResult {
  success: boolean
  data?: UploadResponse | UploadMultipleResponse
  error?: string
}

export interface UploadMultipleResult {
  success: boolean
  data?: UploadMultipleResponse
  error?: string
  successCount?: number
  totalFiles?: number
}

/**
 * Service class for handling file uploads
 */
export class FileUploadService {
  /**
   * Uploads a single file to a project
   */
  async uploadSingleFile(
    getToken: GetToken | undefined,
    projectId: string,
    fileData: UploadFileData,
  ): Promise<UploadResult> {
    try {
      const result = await api.uploadFile(getToken, projectId, fileData)

      if (result.kind === "ok") {
        return {
          success: true,
          data: result.file,
        }
      } else {
        return {
          success: false,
          error: "Failed to upload file",
        }
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  /**
   * Uploads multiple files to a project
   */
  async uploadMultipleFiles(
    getToken: GetToken | undefined,
    projectId: string,
    filesData: UploadFileData[],
  ): Promise<UploadMultipleResult> {
    try {
      const result = await api.uploadMultipleFiles(getToken, projectId, filesData)

      if (result.kind === "ok") {
        return {
          success: true,
          data: result.response,
          successCount: result.response.successCount,
          totalFiles: result.response.totalFiles,
        }
      } else {
        return {
          success: false,
          error: "Failed to upload files",
          totalFiles: filesData.length,
          successCount: 0,
        }
      }
    } catch (error) {
      console.error("Error uploading multiple files:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        totalFiles: filesData.length,
        successCount: 0,
      }
    }
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

// Singleton instance of the FileUploadService for convenience
export const fileUploadService = new FileUploadService()
