import { useEffect } from "react"
import { useAuth } from "@clerk/clerk-react"
import { useStores } from "../models"

/**
 * Hook para manejar la obtención y estado de los proyectos
 */
export const useProjects = () => {
  const { getToken } = useAuth()
  const { projectStore } = useStores()

  // Función para obtener proyectos
  const fetchProjects = async () => {
    await projectStore.fetchProjects(getToken)
  }

  // Función para refrescar proyectos
  const refreshProjects = async () => {
    await projectStore.fetchProjects(getToken)
  }

  // Obtener proyectos al montar el hook
  useEffect(() => {
    fetchProjects()
  }, [])

  // Filtrar proyectos por estado
  const getProjectsByStatus = (status?: string) => {
    if (!status || status === "All") {
      return projectStore.projects
    }
    return projectStore.projects.filter((project) => project.status === status)
  }

  return {
    projects: projectStore.projects,
    isLoading: projectStore.isLoading,
    error: projectStore.error,
    hasProjects: projectStore.hasProjects,
    projectCount: projectStore.projectCount,
    fetchProjects,
    refreshProjects,
    getProjectsByStatus,
    getProjectById: projectStore.getProjectById,
  }
}
