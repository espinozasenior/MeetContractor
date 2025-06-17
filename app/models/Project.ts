import { type Instance, type SnapshotIn, type SnapshotOut, types } from "mobx-state-tree"

/**
 * Conversation model within a project
 */
export const ConversationModel = types.model("Conversation").props({
  id: types.identifier,
  title: types.string,
  createdAt: types.string,
  updatedAt: types.string,
  lastReadAt: types.maybeNull(types.string),
  lastMessageAt: types.maybeNull(types.string),
  visibility: types.string,
})

/**
 * Location model for project coordinates
 */
export const LocationModel = types.model("Location").props({
  latitude: types.number,
  longitude: types.number,
})

/**
 * Project model matching the API response structure
 */
export const ProjectModel = types
  .model("Project")
  .props({
    id: types.identifier,
    ownerId: types.string,
    name: types.string,
    description: types.maybeNull(types.string),
    addressLine1: types.string,
    addressLine2: types.maybeNull(types.string),
    city: types.string,
    state: types.string,
    postalCode: types.string,
    location: types.maybeNull(LocationModel),
    status: types.string,
    createdAt: types.string,
    updatedAt: types.string,
    conversations: types.array(ConversationModel),
    images: types.array(types.string),
  })
  .actions((self) => ({
    updateName(name: string) {
      self.name = name
    },
    updateDescription(description: string | null) {
      self.description = description
    },
    updateAddress(addressLine1: string, addressLine2?: string | null) {
      self.addressLine1 = addressLine1
      self.addressLine2 = addressLine2 || null
    },
    updateLocation(latitude: number, longitude: number) {
      self.location = { latitude, longitude }
    },
    touch() {
      self.updatedAt = new Date().toISOString()
    },
  }))
  .views((self) => ({
    get fullAddress() {
      const parts = [self.addressLine1, self.addressLine2, self.city, self.state, self.postalCode]
      return parts.filter(Boolean).join(", ")
    },
    get hasLocation() {
      return self.location !== null
    },
  }))

export interface Project extends Instance<typeof ProjectModel> {}
export interface ProjectSnapshotOut extends SnapshotOut<typeof ProjectModel> {}
export interface ProjectSnapshotIn extends SnapshotIn<typeof ProjectModel> {}
export interface Conversation extends Instance<typeof ConversationModel> {}
export interface Location extends Instance<typeof LocationModel> {}
