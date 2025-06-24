import { useEffect, useState, useCallback, useRef } from "react"
import { useAuth } from "@clerk/clerk-react"
import { useStores } from "../models"

/**
 * Hook para manejar la obtención y estado de los proyectos
 */
export const useProjects = () => {
  const { getToken } = useAuth()
  const { projectStore } = useStores()
  const [currentFilter, setCurrentFilter] = useState<"active" | "closed" | undefined>(undefined)
  const isFetchingRef = useRef(false)

  // Función para obtener proyectos con filtro opcional
  const fetchProjects = useCallback(
    async (status?: "active" | "closed") => {
      // Evitar llamadas simultáneas
      if (isFetchingRef.current) {
        console.log("🛑 useProjects: fetchProjects ya está en progreso, ignorando nueva llamada")
        return
      }

      console.log("🎯 useProjects: fetchProjects iniciado", { status })
      isFetchingRef.current = true

      try {
        await projectStore.fetchProjects(getToken, status)
        setCurrentFilter(status)
        console.log("✅ useProjects: fetchProjects completado exitosamente")
      } catch (error) {
        console.error("❌ useProjects: Error en fetchProjects:", error)
      } finally {
        isFetchingRef.current = false
      }
    },
    [projectStore, getToken],
  )

  // Función para refrescar proyectos manteniendo el filtro actual
  const refreshProjects = useCallback(async () => {
    console.log("🔄 useProjects: refreshProjects iniciado")
    await fetchProjects(currentFilter)
  }, [fetchProjects, currentFilter])

  // Obtener proyectos al montar el hook (sin filtro - todos los proyectos)
  useEffect(() => {
    console.log("🎬 useProjects: useEffect inicial ejecutándose")
    fetchProjects()
  }, [fetchProjects])

  // Filtrar proyectos por estado (ya no necesario porque la API filtra)
  const getProjectsByStatus = (_status?: string) => {
    // Como la API ahora filtra, simplemente devolvemos todos los proyectos
    // que ya están filtrados por la API
    return projectStore.projects
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
    currentFilter,
  }
}
