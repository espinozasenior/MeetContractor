/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
// eslint-disable-next-line no-restricted-imports
import * as React from "react"
import { NavigationContainer, NavigatorScreenParams } from "@react-navigation/native"
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack"
import { observer } from "mobx-react-lite"
import * as Screens from "@/screens"
import Config from "../config"
import { useStores } from "../models"
import { DemoNavigator, DemoTabParamList } from "./DemoNavigator"
import { navigationRef, useBackButtonHandler } from "./navigationUtilities"
import { useAppTheme, useThemeProvider } from "@/utils/useAppTheme"
import { ComponentProps, useEffect, useState } from "react"
import { useAuth } from "@clerk/clerk-expo"

/**
 * This type allows TypeScript to know what routes are defined in this navigator
 * as well as what properties (if any) they might take when navigating to them.
 *
 * If no params are allowed, pass through `undefined`. Generally speaking, we
 * recommend using your MobX-State-Tree store(s) to keep application state
 * rather than passing state through navigation params.
 *
 * For more information, see this documentation:
 *   https://reactnavigation.org/docs/params/
 *   https://reactnavigation.org/docs/typescript#type-checking-the-navigator
 *   https://reactnavigation.org/docs/typescript/#organizing-types
 */
export type AppStackParamList = {
  Welcome: undefined
  Login: undefined
  Demo: NavigatorScreenParams<DemoTabParamList>
  Chat: undefined
  CreateProject: undefined
  CreateProjectForm: {
    address?: {
      street?: string
      city?: string
      region?: string
      postalCode?: string
      formattedAddress?: string
      coordinates?: {
        latitude?: number
        longitude?: number
      }
    }
  }
  ProjectSuccess: {
    projectId?: string
    projectName?: string
    address?: string
  }
}

/**
 * This is a list of all the route names that will exit the app if the back button
 * is pressed while in that screen. Only affects Android.
 */
const exitRoutes = Config.exitRoutes

export type AppStackScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<
  AppStackParamList,
  T
>

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<AppStackParamList>()

const AppStack = observer(function AppStack() {
  const {
    authenticationStore: { isAuthenticated },
    projectStore: { hasProjects, isLoading, fetchProjects },
  } = useStores()
  const { getToken } = useAuth()
  const [isProjectsChecked, setIsProjectsChecked] = useState(false)

  const {
    theme: { colors },
  } = useAppTheme()
  console.log("hasProjects", hasProjects)
  // Check for projects when authenticated
  useEffect(() => {
    const checkProjects = async () => {
      if (isAuthenticated && !isProjectsChecked) {
        try {
          await fetchProjects(getToken)
        } catch (error) {
          console.error("Error checking projects:", error)
        } finally {
          setIsProjectsChecked(true)
        }
      }
    }

    checkProjects()
  }, [isAuthenticated, fetchProjects, getToken, isProjectsChecked])

  // Show loading while checking projects
  if (isAuthenticated && isLoading && !isProjectsChecked) {
    return <Screens.LoadingScreen />
  }

  // Determine initial route based on projects
  const getInitialRoute = () => {
    if (!isAuthenticated) return "Login"
    return hasProjects ? "Demo" : "Welcome"
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        navigationBarColor: colors.background,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
      initialRouteName={getInitialRoute()}
    >
      {isAuthenticated ? (
        <React.Fragment>
          <Stack.Screen name="Welcome" component={Screens.WelcomeScreen} />

          <Stack.Screen name="Demo" component={DemoNavigator} />

          <Stack.Screen name="Chat" component={Screens.ChatScreen} />
          <Stack.Screen name="CreateProject" component={Screens.CreateProject} />
          <Stack.Screen name="CreateProjectForm" component={Screens.CreateProjectForm} />
          <Stack.Screen name="ProjectSuccess" component={Screens.ProjectSuccess} />
        </React.Fragment>
      ) : (
        <>
          <Stack.Screen name="Login" component={Screens.LoginScreen} />
        </>
      )}
    </Stack.Navigator>
  )
})

export interface NavigationProps
  extends Partial<ComponentProps<typeof NavigationContainer<AppStackParamList>>> {}

export const AppNavigator = observer(function AppNavigator(props: NavigationProps) {
  const { themeScheme, navigationTheme, setThemeContextOverride, ThemeProvider } =
    useThemeProvider()

  useBackButtonHandler((routeName) => exitRoutes.includes(routeName))

  return (
    <ThemeProvider value={{ themeScheme, setThemeContextOverride }}>
      <NavigationContainer ref={navigationRef} theme={navigationTheme} {...props}>
        <AppStack />
      </NavigationContainer>
    </ThemeProvider>
  )
})
