import { type Instance, type SnapshotOut, types } from "mobx-state-tree"
import { ProjectModel } from "./Project"
import { api } from "../services/api"
import { withSetPropAction } from "./helpers/withSetPropAction"
import type { GetToken } from "@clerk/types"

/**
 * Model description here for TypeScript hints.
 */
export const ProjectStoreModel = types
  .model("ProjectStore")
  .props({
    projects: types.array(ProjectModel),
    isLoading: types.optional(types.boolean, false),
    error: types.maybeNull(types.string),
  })
  .actions(withSetPropAction)
  .actions((self) => ({
    async fetchProjects(getToken: GetToken | undefined) {
      self.setProp("isLoading", true)
      self.setProp("error", null)

      try {
        const response = await api.getProjects(getToken)
        if (response.kind === "ok") {
          self.setProp("projects", response.projects.projects)
        } else {
          self.setProp("error", "Failed to fetch projects")
          console.error(`Error fetching projects: ${JSON.stringify(response)}`)
        }
      } catch (error) {
        self.setProp("error", error instanceof Error ? error.message : "Unknown error")
        console.error("Error fetching projects:", error)
      } finally {
        self.setProp("isLoading", false)
      }
    },
    addProject(project: {
      id: string
      ownerId: string
      name: string
      description?: string | null
      addressLine1: string
      addressLine2?: string | null
      city: string
      state: string
      postalCode: string
      location?: { latitude: number; longitude: number } | null
      status: string
    }) {
      const now = new Date().toISOString()
      self.projects.push({
        id: project.id,
        ownerId: project.ownerId,
        name: project.name,
        description: project.description || null,
        addressLine1: project.addressLine1,
        addressLine2: project.addressLine2 || null,
        city: project.city,
        state: project.state,
        postalCode: project.postalCode,
        location: project.location || null,
        status: project.status,
        createdAt: now,
        updatedAt: now,
        conversations: [],
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
