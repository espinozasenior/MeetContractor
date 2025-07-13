import { type ApisauceInstance, create } from "apisauce"
import Config from "../../config"
import type { ApiConfig } from "./api.types"

/**
 * Configuración por defecto de la API
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  url: Config.API_URL,
  timeout: 10000,
}

/**
 * Clase base para todos los servicios de API
 * Proporciona la configuración común y el cliente apisauce
 */
export class BaseApi {
  protected apisauce: ApisauceInstance
  protected config: ApiConfig

  constructor(config: ApiConfig = DEFAULT_API_CONFIG) {
    this.config = config
    this.apisauce = create({
      baseURL: this.config.url,
      timeout: this.config.timeout,
      headers: {
        Accept: "application/json",
      },
    })
  }

  /**
   * Obtiene el cliente apisauce configurado
   */
  getClient(): ApisauceInstance {
    return this.apisauce
  }
}
