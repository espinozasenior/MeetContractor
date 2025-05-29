import { type Instance, type SnapshotIn, type SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const ProjectModel = types
  .model("Project")
  .props({
    id: types.identifier,
    name: types.string,
    address: types.string,
    createdAt: types.Date,
    updatedAt: types.Date,
  })
  .actions((self) => ({
    updateName(name: string) {
      self.name = name
    },
    updateAddress(address: string) {
      self.address = address
    },
    touch() {
      self.updatedAt = new Date()
    },
  }))

export interface Project extends Instance<typeof ProjectModel> {}
export interface ProjectSnapshotOut extends SnapshotOut<typeof ProjectModel> {}
export interface ProjectSnapshotIn extends SnapshotIn<typeof ProjectModel> {}
