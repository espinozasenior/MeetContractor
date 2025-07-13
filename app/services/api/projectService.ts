import { type ApiResponse } from "apisauce"
import type { GetToken } from "@clerk/types"
import { type GeneralApiProblem, getGeneralApiProblem } from "./apiProblem"
import { BaseApi } from "./baseApi"
import type { CreateProjectRequest, CreateProjectResponse, GetProjectsResponse } from "./api.types"

/**
 * Servicio para manejar todas las operaciones relacionadas con proyectos
 */
export class ProjectService extends BaseApi {
  /**
   * Crea un nuevo proyecto
   */
  async createProject(
    getToken: GetToken | undefined,
    projectData: CreateProjectRequest,
  ): Promise<{ kind: "ok"; project: CreateProjectResponse } | GeneralApiProblem> {
    // obtener el token de la sesión de clerk
    const token = await getToken?.()

    // realizar la llamada a la API
    const response: ApiResponse<CreateProjectResponse> = await this.apisauce.post(
      "projects",
      projectData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    // verificar errores en la respuesta
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    // transformar los datos al formato esperado
    try {
      const rawData = response.data

      if (!rawData) {
        return { kind: "bad-data" }
      }

      return { kind: "ok", project: rawData }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  /**
   * Obtiene todos los proyectos del usuario autenticado
   */
  async getProjects(
    getToken: GetToken | undefined,
    status?: "active" | "closed",
  ): Promise<{ kind: "ok"; projects: GetProjectsResponse } | GeneralApiProblem> {
    // obtener el token de la sesión de clerk
    const token = await getToken?.()

    // Preparar parámetros de consulta - solo agregar status si se proporciona
    const queryParams = status ? { status } : {}

    // realizar la llamada a la API
    const response: ApiResponse<GetProjectsResponse> = await this.apisauce.get(
      "projects",
      queryParams,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    // verificar errores en la respuesta
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    // transformar los datos al formato esperado
    try {
      const rawData = response.data

      if (!rawData) {
        return { kind: "bad-data" }
      }

      return { kind: "ok", projects: rawData }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  /**
   * Obtiene un proyecto específico por ID
   */
  async getProject(
    getToken: GetToken | undefined,
    projectId: string,
  ): Promise<{ kind: "ok"; project: CreateProjectResponse } | GeneralApiProblem> {
    // obtener el token de la sesión de clerk
    const token = await getToken?.()

    // realizar la llamada a la API
    const response: ApiResponse<CreateProjectResponse> = await this.apisauce.get(
      `projects/${projectId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    // verificar errores en la respuesta
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    // transformar los datos al formato esperado
    try {
      const rawData = response.data

      if (!rawData) {
        return { kind: "bad-data" }
      }

      return { kind: "ok", project: rawData }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  /**
   * Actualiza un proyecto existente
   */
  async updateProject(
    getToken: GetToken | undefined,
    projectId: string,
    projectData: Partial<CreateProjectRequest>,
  ): Promise<{ kind: "ok"; project: CreateProjectResponse } | GeneralApiProblem> {
    // obtener el token de la sesión de clerk
    const token = await getToken?.()

    // realizar la llamada a la API
    const response: ApiResponse<CreateProjectResponse> = await this.apisauce.put(
      `projects/${projectId}`,
      projectData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    // verificar errores en la respuesta
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    // transformar los datos al formato esperado
    try {
      const rawData = response.data

      if (!rawData) {
        return { kind: "bad-data" }
      }

      return { kind: "ok", project: rawData }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  /**
   * Elimina un proyecto
   */
  async deleteProject(
    getToken: GetToken | undefined,
    projectId: string,
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    // obtener el token de la sesión de clerk
    const token = await getToken?.()

    // realizar la llamada a la API
    const response: ApiResponse<void> = await this.apisauce.delete(
      `projects/${projectId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    // verificar errores en la respuesta
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    return { kind: "ok" }
  }
}
