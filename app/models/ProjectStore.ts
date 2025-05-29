import { type Instance, type SnapshotOut, types } from "mobx-state-tree"
import { ProjectModel } from "./Project"

/**
 * Model description here for TypeScript hints.
 */
export const ProjectStoreModel = types
  .model("ProjectStore")
  .props({
    projects: types.array(ProjectModel),
  })
  .actions((self) => ({
    addProject(project: { id: string; name: string; address: string }) {
      const now = new Date()
      self.projects.push({
        id: project.id,
        name: project.name,
        address: project.address,
        createdAt: now,
        updatedAt: now,
      })
    },
    removeProject(id: string) {
      const project = self.projects.find((p) => p.id === id)
      if (project) {
        self.projects.remove(project)
      }
    },
    clearProjects() {
      self.projects.clear()
    },
  }))
  .views((self) => ({
    get hasProjects() {
      return self.projects.length > 0
    },
    get projectCount() {
      return self.projects.length
    },
    getProjectById(id: string) {
      return self.projects.find((project) => project.id === id)
    },
  }))

export interface ProjectStore extends Instance<typeof ProjectStoreModel> {}
export interface ProjectStoreSnapshot extends SnapshotOut<typeof ProjectStoreModel> {}
