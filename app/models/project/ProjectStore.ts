import { type Instance, type SnapshotOut, types } from "mobx-state-tree"
import { ProjectModel } from "./Project"
import { projectService } from "@/services/api"
import { withSetPropAction } from "@/models/helpers/withSetPropAction"
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
    async fetchProjects(getToken: GetToken | undefined, status?: "active" | "closed") {
      console.log("🚀 ProjectStore: fetchProjects iniciado", { status, hasGetToken: !!getToken })
      self.setProp("isLoading", true)
      self.setProp("error", null)

      try {
        // Verificar que getToken esté disponible
        if (!getToken) {
          console.error("❌ ProjectStore: getToken no está disponible")
          throw new Error("Authentication token not available")
        }

        console.log("📡 ProjectStore: Llamando a api.getProjects...")
        const response = await projectService.getProjects(getToken, status)
        console.log("📡 ProjectStore: Respuesta recibida", { kind: response.kind })

        if (response.kind === "ok") {
          const projectsData = response.projects.projects
          console.log(`✅ ProjectStore: ${projectsData?.length || 0} proyectos obtenidos`)
          self.setProp("projects", projectsData)
        } else {
          console.error("❌ ProjectStore: Error en respuesta de API", response)
          self.setProp("error", "Failed to fetch projects")
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        console.error("❌ ProjectStore: Error en fetchProjects:", error)
        self.setProp("error", errorMessage)
      } finally {
        console.log("🏁 ProjectStore: fetchProjects finalizado, estableciendo isLoading = false")
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
