import { useState } from "react"
import { Alert } from "react-native"
import * as ImagePicker from "expo-image-picker"
import * as DocumentPicker from "expo-document-picker"
import type { GetToken } from "@clerk/types"
import { fileUploadService } from "@/services/file/fileUpload"
import {
  getCameraOptions,
  getGalleryOptions,
  getDocumentPickerOptions,
  convertAssetsToUploadData,
  convertImagePickerAsset,
} from "@/utils/fileUtils"

export interface UseFileUploadProps {
  projectId?: string
  getToken?: GetToken
  onUploadSuccess?: (message: string) => void
  onUploadError?: (error: string) => void
  customCameraOptions?: Array<{
    text: string
    onPress: () => void
    style?: "cancel" | "default" | "destructive"
  }>
  customUploadOptions?: Array<{
    text: string
    onPress: () => void
    style?: "cancel" | "default" | "destructive"
  }>
}

export interface UseFileUploadReturn {
  isUploading: boolean
  handleTakePhotos: () => Promise<void>
  handleUploadPhotos: () => Promise<void>
  launchCamera: (mediaType: "photo" | "video") => Promise<void>
  selectFromGallery: () => Promise<void>
  selectDocuments: () => Promise<void>
  uploadFiles: (filesData: any[]) => Promise<void>
}

export const useFileUpload = ({
  projectId,
  getToken,
  onUploadSuccess,
  onUploadError,
  customCameraOptions,
  customUploadOptions,
}: UseFileUploadProps): UseFileUploadReturn => {
  const [isUploading, setIsUploading] = useState(false)

  const handleTakePhotos = async () => {
    if (!projectId) {
      Alert.alert("Error", "Project ID is required")
      return
    }

    // Request camera permissions
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync()

      if (status !== "granted") {
        Alert.alert("Permission Required", "Camera permission is required to take photos.")
        return
      }

      // Use custom options or default camera action sheet
      const actionSheetOptions = customCameraOptions || [
        {
          text: "Photo",
          onPress: () => launchCamera("photo"),
        },
        {
          text: "Video",
          onPress: () => launchCamera("video"),
        },
        {
          text: "Cancel",
          style: "cancel" as const,
        },
      ]

      // Show action sheet for camera options
      Alert.alert("Take Media", "Choose what you want to capture", actionSheetOptions)
    } catch (error) {
      console.error("Error requesting camera permission:", error)
      Alert.alert("Error", "Failed to access camera")
    }
  }

  const handleUploadPhotos = async () => {
    if (!projectId) {
      Alert.alert("Error", "Project ID is required")
      return
    }

    // Request media library permissions
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (status !== "granted") {
        Alert.alert("Permission Required", "Media library permission is required to select files.")
        return
      }

      // Use custom options or default upload action sheet
      const actionSheetOptions = customUploadOptions || [
        {
          text: "Photos/Videos",
          onPress: selectFromGallery,
        },
        {
          text: "Documents",
          onPress: selectDocuments,
        },
        {
          text: "Cancel",
          style: "cancel" as const,
        },
      ]

      // Show action sheet for upload options
      Alert.alert("Upload Media", "Choose what you want to upload", actionSheetOptions)
    } catch (error) {
      console.error("Error requesting media library permission:", error)
      Alert.alert("Error", "Failed to access media library")
    }
  }

  const launchCamera = async (mediaType: "photo" | "video") => {
    try {
      const result = await ImagePicker.launchCameraAsync(getCameraOptions(mediaType))

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0]

        // Check file size (25MB limit)
        if (asset.fileSize && asset.fileSize > 25 * 1024 * 1024) {
          Alert.alert("File Too Large", "File size must be less than 25MB")
          return
        }

        const fileData = convertImagePickerAsset(asset)
        await uploadFiles([fileData])
      }
    } catch (error) {
      console.error("Error launching camera:", error)
      Alert.alert("Error", "Failed to capture media")
    }
  }

  const selectFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync(getGalleryOptions())

      if (!result.canceled && result.assets.length > 0) {
        // Filter valid assets manually for ImagePicker
        const validAssets = result.assets.filter((asset) => {
          if (asset.fileSize && asset.fileSize > 25 * 1024 * 1024) {
            Alert.alert(
              "File Too Large",
              `${asset.fileName || "File"} is larger than 25MB and will be skipped`,
            )
            return false
          }
          return true
        })

        if (validAssets.length > 0) {
          const filesData = convertAssetsToUploadData(validAssets)
          await uploadFiles(filesData)
        }
      }
    } catch (error) {
      console.error("Error selecting from gallery:", error)
      Alert.alert("Error", "Failed to select media")
    }
  }

  const selectDocuments = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync(getDocumentPickerOptions())

      if (!result.canceled && result.assets.length > 0) {
        // Filter valid assets manually for DocumentPicker
        const validAssets = result.assets.filter((asset) => {
          if (asset.size && asset.size > 25 * 1024 * 1024) {
            Alert.alert("File Too Large", `${asset.name} is larger than 25MB and will be skipped`)
            return false
          }
          return true
        })

        if (validAssets.length > 0) {
          const filesData = convertAssetsToUploadData(validAssets)
          await uploadFiles(filesData)
        }
      }
    } catch (error) {
      console.error("Error selecting documents:", error)
      Alert.alert("Error", "Failed to select documents")
    }
  }

  const uploadFiles = async (filesData: any[]) => {
    if (!projectId || !getToken) {
      Alert.alert("Error", "Project ID and authentication are required")
      return
    }

    setIsUploading(true)

    try {
      let result

      if (filesData.length === 1) {
        result = await fileUploadService.uploadSingleFile(getToken, projectId, filesData[0])
      } else {
        result = await fileUploadService.uploadMultipleFiles(getToken, projectId, filesData)
      }

      if (result.success) {
        const message = fileUploadService.getSuccessMessage(filesData.length)
        onUploadSuccess?.(message)
        Alert.alert("Success", message)
      } else {
        const error = fileUploadService.getErrorMessage(result.error)
        onUploadError?.(error)
        Alert.alert("Error", error)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      onUploadError?.(errorMessage)
      Alert.alert("Error", errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  return {
    isUploading,
    handleTakePhotos,
    handleUploadPhotos,
    launchCamera,
    selectFromGallery,
    selectDocuments,
    uploadFiles,
  }
}
