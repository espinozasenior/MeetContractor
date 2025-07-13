import { useCallback } from "react"
import { useAuth } from "@clerk/clerk-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { projectService } from "@/services/api"
import type { CreateProjectRequest, ProjectResponse } from "@/services/api/api.types"

// Claves para las consultas de proyectos
const PROJECTS_QUERY_KEY = "projects"

/**
 * Hook para manejar la obtención y estado de los proyectos usando TanStack Query
 * @param params Opciones para filtrar proyectos
 * @param params.status Filtro por estado: 'active' o 'closed'
 */
export const useProjects = ({ status }: { status?: "active" | "closed" } = {}) => {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  // Consulta principal para obtener proyectos con TanStack Query
  const {
    data: projectsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [PROJECTS_QUERY_KEY, status],
    queryFn: async () => {
      console.log("🎯 useProjects: obteniendo proyectos", {
        status,
      })
      if (!getToken) {
        throw new Error("Authentication token not available")
      }

      const response = await projectService.getProjects(getToken, status)
      if (response.kind === "ok") {
        console.log(
          `✅ useProjects: ${response.projects.projects?.length || 0} proyectos obtenidos`,
        )
        return response.projects.projects
      } else {
        console.error("❌ useProjects: Error en respuesta de API", response)
        throw new Error("Failed to fetch projects")
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos de frescura
    gcTime: 10 * 60 * 1000, // 10 minutos en caché
  })

  // Mutación para crear un nuevo proyecto
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: CreateProjectRequest) => {
      if (!getToken) {
        throw new Error("Authentication token not available")
      }

      const response = await projectService.createProject(getToken, projectData)
      if (response.kind === "ok") {
        // Tratar la respuesta como ProjectResponse aunque técnicamente es CreateProjectResponse
        return response.project as unknown as ProjectResponse
      } else {
        throw new Error("Failed to create project")
      }
    },
    onSuccess: async () => {
      // Invalidar consultas para recargar proyectos
      await queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] })
    },
  })

  // Mutación para actualizar un proyecto
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateProjectRequest> }) => {
      if (!getToken) {
        throw new Error("Authentication token not available")
      }

      const response = await projectService.updateProject(getToken, id, data)
      if (response.kind === "ok") {
        // Tratar la respuesta como ProjectResponse aunque técnicamente es CreateProjectResponse
        return response.project as unknown as ProjectResponse
      } else {
        throw new Error("Failed to update project")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] })
    },
  })

  // Mutación para eliminar un proyecto
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      if (!getToken) {
        throw new Error("Authentication token not available")
      }

      const response = await projectService.deleteProject(getToken, projectId)
      if (response.kind === "ok") {
        return projectId
      } else {
        throw new Error("Failed to delete project")
      }
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] })
      // También podemos actualizar la caché directamente para una actualización más rápida
      queryClient.setQueryData(
        [PROJECTS_QUERY_KEY, status],
        (old: ProjectResponse[] | undefined) => {
          return old ? old.filter((project) => project.id !== deletedId) : []
        },
      )
    },
  })

  // Función para refrescar proyectos
  const refreshProjects = useCallback(() => {
    console.log("🔄 useProjects: refreshProjects iniciado")
    return refetch()
  }, [refetch])

  // Función para obtener un proyecto por ID
  const getProjectById = useCallback(
    (id: string) => {
      return projectsData?.find((project) => project.id === id)
    },
    [projectsData],
  )

  // Preparar proyectos y propiedades derivadas
  const projects = projectsData || []
  const hasProjects = projects.length > 0
  const projectCount = projects.length

  return {
    projects,
    isLoading,
    error: error ? (error as Error).message : null,
    hasProjects,
    projectCount,
    refreshProjects,
    getProjectById,
    createProject: createProjectMutation.mutateAsync,
    updateProject: updateProjectMutation.mutateAsync,
    deleteProject: deleteProjectMutation.mutateAsync,
    isCreating: createProjectMutation.isPending,
    isUpdating: updateProjectMutation.isPending,
    isDeleting: deleteProjectMutation.isPending,
  }
}
