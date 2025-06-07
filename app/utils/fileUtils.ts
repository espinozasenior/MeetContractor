import * as ImagePicker from "expo-image-picker"
import * as DocumentPicker from "expo-document-picker"
import type { UploadFileData } from "@/services/api/api.types"

/**
 * File size constants
 */
export const FILE_SIZE_LIMITS = {
  MAX_SIZE_MB: 25,
  MAX_SIZE_BYTES: 25 * 1024 * 1024,
}

/**
 * Supported file formats
 */
export const SUPPORTED_FORMATS = {
  VIDEO: [".mp4", ".wav"],
  IMAGE: [".jpeg", ".png", ".jpg"],
  DOCUMENT: ["application/pdf"],
}

/**
 * Validates if a file size is within the allowed limit
 */
export const isFileSizeValid = (fileSize?: number): boolean => {
  if (!fileSize) return true
  return fileSize <= FILE_SIZE_LIMITS.MAX_SIZE_BYTES
}

/**
 * Converts ImagePicker asset to UploadFileData format
 */
export const convertImagePickerAsset = (
  asset: ImagePicker.ImagePickerAsset,
  index?: number,
): UploadFileData => {
  const timestamp = Date.now()
  const fileExtension = asset.type === "image" ? "jpg" : "mp4"
  const defaultName = `${asset.type}_${timestamp}${index !== undefined ? `_${index}` : ""}.${fileExtension}`

  return {
    uri: asset.uri,
    type: asset.type === "image" ? "image/jpeg" : "video/mp4",
    name: asset.fileName || defaultName,
  }
}

/**
 * Converts DocumentPicker asset to UploadFileData format
 */
export const convertDocumentPickerAsset = (
  asset: DocumentPicker.DocumentPickerAsset,
  index?: number,
): UploadFileData => {
  const timestamp = Date.now()
  const defaultName = `document_${timestamp}${index !== undefined ? `_${index}` : ""}`

  return {
    uri: asset.uri,
    type: asset.mimeType || "application/octet-stream",
    name: asset.name || defaultName,
  }
}

/**
 * Converts multiple assets (both types) to UploadFileData format
 */
export const convertAssetsToUploadData = (
  assets: (ImagePicker.ImagePickerAsset | DocumentPicker.DocumentPickerAsset)[],
): UploadFileData[] => {
  return assets.map((asset, index) => {
    const isImagePickerAsset = "type" in asset

    if (isImagePickerAsset) {
      return convertImagePickerAsset(asset as ImagePicker.ImagePickerAsset, index)
    } else {
      return convertDocumentPickerAsset(asset as DocumentPicker.DocumentPickerAsset, index)
    }
  })
}

/**
 * Filters assets by file size, returns valid assets and shows alerts for invalid ones
 */
export const filterValidAssets = <
  T extends { fileSize?: number; fileName?: string; name?: string },
>(
  assets: T[],
  showAlert: (title: string, message: string) => void,
): T[] => {
  const validAssets: T[] = []

  assets.forEach((asset) => {
    const fileSize = asset.fileSize || (asset as any).size
    const fileName = asset.fileName || (asset as any).name || "File"

    if (isFileSizeValid(fileSize)) {
      validAssets.push(asset)
    } else {
      showAlert(
        "File Too Large",
        `${fileName} is larger than ${FILE_SIZE_LIMITS.MAX_SIZE_MB}MB and will be skipped`,
      )
    }
  })

  return validAssets
}

/**
 * Camera options configuration
 */
export const getCameraOptions = (mediaType: "photo" | "video"): ImagePicker.ImagePickerOptions => ({
  mediaTypes:
    mediaType === "photo"
      ? ImagePicker.MediaTypeOptions.Images
      : ImagePicker.MediaTypeOptions.Videos,
  allowsEditing: true,
  aspect: mediaType === "photo" ? [4, 3] : undefined,
  quality: 0.8,
  videoMaxDuration: 60,
})

/**
 * Gallery options configuration
 */
export const getGalleryOptions = (): ImagePicker.ImagePickerOptions => ({
  mediaTypes: ImagePicker.MediaTypeOptions.All,
  allowsMultipleSelection: true,
  quality: 0.8,
  videoMaxDuration: 60,
})

/**
 * Document picker options configuration
 */
export const getDocumentPickerOptions = (): DocumentPicker.DocumentPickerOptions => ({
  type: ["application/pdf", "image/*", "video/*"],
  multiple: true,
  copyToCacheDirectory: true,
})
