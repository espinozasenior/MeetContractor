import { Instance, SnapshotOut, types, flow } from "mobx-state-tree"

export const AuthenticationStoreModel = types
  .model("AuthenticationStore")
  .props({
    authToken: types.maybe(types.string),
  })
  .views((store) => ({
    get isAuthenticated() {
      return !!store.authToken
    },
  }))
  .actions((store) => ({
    setAuthToken(value?: string) {
      store.authToken = value
    },
    logout: flow(function* logout(signOut?: () => Promise<void>) {
      console.log("logout action: attempting sign out")
      if (signOut) {
        try {
          console.log("logout action: calling signOut")
          yield signOut()
          console.log("logout action: signOut completed")
        } catch (error) {
          console.error("logout action: Error during Clerk signOut:", error)
          // Optionally handle the error, e.g., show a message to the user
          // For now, we'll proceed to clear the local token regardless
        }
      } else {
        console.warn("logout action: signOut function not provided.")
      }
      console.log("logout action: clearing token")
      store.authToken = undefined
      console.log("logout action: token cleared")
    }),
  }))

export interface AuthenticationStore extends Instance<typeof AuthenticationStoreModel> {}
export interface AuthenticationStoreSnapshot extends SnapshotOut<typeof AuthenticationStoreModel> {}
