import { type Instance, type SnapshotOut, types } from "mobx-state-tree"
import { AuthenticationStoreModel } from "./auth/AuthenticationStore"

import { ProjectStoreModel } from "./project/ProjectStore"

/**
 * A RootStore model.
 */
export const RootStoreModel = types.model("RootStore").props({
  authenticationStore: types.optional(AuthenticationStoreModel, {}),
  projectStore: types.optional(ProjectStoreModel, {}),
})

/**
 * The RootStore instance.
 */
export interface RootStore extends Instance<typeof RootStoreModel> {}
/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> {}
