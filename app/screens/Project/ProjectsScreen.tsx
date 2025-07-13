import { FC, useState, useRef } from "react"
import {
  Image,
  ImageStyle,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native"
import { Screen, Text, EmptyState } from "../../components"
import { DemoTabScreenProps } from "../../navigators/DemoNavigator"
import type { ThemedStyle } from "@/theme"
import { observer } from "mobx-react-lite"
import { useHeader } from "@/utils/useHeader"
import { colors } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { useProjects } from "@/hooks"
import type { ProjectResponse } from "@/services/api/api.types"

const { width: screenWidth } = Dimensions.get("window")

enum FilterStatus {
  All = "All",
  Active = "active",
  Closed = "closed",
}

export const ProjectsScreen: FC<DemoTabScreenProps<"DemoShowroom">> = observer(
  function ProjectsScreen(_props) {
    const { navigation } = _props
    const { themed } = useAppTheme()
    const [selectedFilter, setSelectedFilter] = useState<FilterStatus>(FilterStatus.All)

    // Usar el hook useProjects con TanStack Query pasándole el filtro seleccionado
    const { projects, isLoading, error, refreshProjects } = useProjects({
      // Solo pasamos status cuando no es "All"
      status: selectedFilter !== FilterStatus.All ? selectedFilter : undefined,
    })

    const [activeImageIndexes, setActiveImageIndexes] = useState<Record<string, number>>({})
    const flatListRef = useRef<FlatList>(null)
    console.log("isLoading", isLoading)

    useHeader({
      title: "Projects",
      rightText: "Create",
      safeAreaEdges: ["top"],
      rightIcon: "plus",
      rightIconColor: colors.error,
      rightTxOptions: {
        color: colors.palette.primary400,
      },
      onRightPress: () => navigation.navigate("CreateProject"),
    })

    const renderImage = ({ item: imageUrl }: { item: string }) => {
      const cardWidth = screenWidth - 48 // Accounting for padding
      return (
        <View style={themed({ ...$imageWrapper, width: cardWidth })}>
          <Image
            source={{ uri: imageUrl }}
            style={[$cardImage, { width: cardWidth }]}
            resizeMode="cover"
            onLoad={() => console.log("Image loaded successfully:", imageUrl)}
            onError={(error) =>
              console.log("Image load error:", error.nativeEvent.error, "for URL:", imageUrl)
            }
            onLoadStart={() => console.log("Image load started:", imageUrl)}
          />
        </View>
      )
    }

    const renderProjectCard = ({ item }: { item: ProjectResponse }) => {
      const currentActiveIndex = activeImageIndexes[item.id] || 0

      // Creamos la dirección completa manualmente ya que ya no tenemos el getter fullAddress
      const fullAddress = `${item.addressLine1}${item.addressLine2 ? ", " + item.addressLine2 : ""}, ${item.city}, ${item.state}, ${item.postalCode}`

      const renderPaginationDots = () => {
        // Usamos imágenes de demostración ya que ProjectResponse no tiene el campo images
        const imagesList = [
          "https://images.unsplash.com/photo-1579353977828-2a4eab540b9a?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1579353977828-2a4eab540b9a?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1579353977828-2a4eab540b9a?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ]

        return (
          <View style={themed($paginationContainer)}>
            {imagesList.length > 1 &&
              imagesList.map((_, index) => (
                <View
                  key={index}
                  style={themed([
                    $paginationDot,
                    index === currentActiveIndex && $paginationDotActive,
                  ])}
                />
              ))}
          </View>
        )
      }

      return (
        <View style={themed($cardContainer)}>
          <View style={themed($cardImageContainer)}>
            <FlatList
              ref={flatListRef}
              data={[
                "https://images.unsplash.com/photo-1579353977828-2a4eab540b9a?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                "https://images.unsplash.com/photo-1579353977828-2a4eab540b9a?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                "https://images.unsplash.com/photo-1579353977828-2a4eab540b9a?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
              ]}
              renderItem={renderImage}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => index.toString()}
              onMomentumScrollEnd={(event) => {
                const newIndex = Math.round(event.nativeEvent.contentOffset.x / (screenWidth - 48))
                setActiveImageIndexes((prev) => ({ ...prev, [item.id]: newIndex }))
              }}
            />
            {renderPaginationDots()}
            <View style={themed($statusBadge)}>
              <Text style={themed($statusText)}>{item.status}</Text>
            </View>
          </View>
          <View style={themed($cardContent)}>
            <Text style={themed($cardTitle)}>{item.description || "No description"}</Text>
            <Text style={themed($projectName)}>{item.name}</Text>
            <Text style={themed($address)}>{fullAddress}</Text>
          </View>
        </View>
      )
    }

    const renderFilterTab = (status: FilterStatus) => (
      <TouchableOpacity
        key={status}
        style={themed([$filterTab, selectedFilter === status && $filterTabActive])}
        onPress={() => {
          setSelectedFilter(status)
        }}
      >
        <Text style={themed([$filterTabText, selectedFilter === status && $filterTabTextActive])}>
          {status}
        </Text>
      </TouchableOpacity>
    )

    return (
      <Screen preset="fixed" contentContainerStyle={themed($container)}>
        {/* Filter Tabs */}
        <View style={themed($filterContainer)}>
          {[FilterStatus.All, FilterStatus.Active, FilterStatus.Closed].map((status) =>
            renderFilterTab(status),
          )}
        </View>

        {/* Loading State */}
        {isLoading ? (
          <View style={themed($loadingContainer)}>
            <ActivityIndicator size="large" color={colors.tint} />
          </View>
        ) : (
          <>
            {/* Projects List */}
            {projects.length === 0 ? (
              <EmptyState
                preset="generic"
                heading="No projects found"
                content="Create your first project to get started"
                button="Create Project"
                buttonOnPress={() => navigation.navigate("CreateProject")}
                style={themed({ flex: 1, padding: 16 })}
              />
            ) : (
              <FlatList
                data={projects}
                renderItem={renderProjectCard}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={themed($listContainer)}
                refreshControl={
                  <RefreshControl
                    refreshing={isLoading}
                    onRefresh={refreshProjects}
                    tintColor={colors.tint}
                  />
                }
              />
            )}

            {error && (
              <View style={themed($errorContainer)}>
                <Text style={themed($errorText)}>Error: {error}</Text>
              </View>
            )}
          </>
        )}
      </Screen>
    )
  },
)

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $filterContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  marginBottom: spacing.md,
  gap: spacing.sm,
  paddingHorizontal: spacing.lg,
})

const $filterTab: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderRadius: 20,
  backgroundColor: colors.palette.neutral100,
})

const $filterTabActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.tint,
})

const $filterTabText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.medium,
  color: colors.textDim,
})

const $filterTabTextActive: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.background,
})

const $listContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingBottom: spacing.xl,
})

const $cardContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.background,
  borderRadius: 12,
  marginHorizontal: spacing.xs,
  marginBottom: spacing.lg,
  shadowColor: colors.palette.neutral800,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
})

const $cardImageContainer: ThemedStyle<ViewStyle> = () => ({
  position: "relative",
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
})

const $imageWrapper: ViewStyle = {
  overflow: "hidden",
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
}

const $cardImage: ImageStyle = {
  height: 200,
  width: "100%",
}

const $statusBadge: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  position: "absolute",
  top: spacing.sm,
  left: spacing.sm,
  backgroundColor: colors.background,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xxs,
  borderRadius: 12,
})

const $statusText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontSize: 12,
  fontFamily: typography.primary.medium,
  color: colors.text,
})

const $cardContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.md,
})

const $cardTitle: ThemedStyle<TextStyle> = ({ typography, colors, spacing }) => ({
  fontSize: 16,
  fontFamily: typography.primary.semiBold,
  color: colors.text,
  marginBottom: spacing.xs,
  lineHeight: 22,
})

const $projectName: ThemedStyle<TextStyle> = ({ typography, colors, spacing }) => ({
  fontSize: 18,
  fontFamily: typography.primary.bold,
  color: colors.text,
  marginBottom: spacing.xxs,
})

const $address: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontSize: 14,
  fontFamily: typography.primary.normal,
  color: colors.textDim,
  lineHeight: 20,
})

const $loadingContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: colors.background,
})

const $errorContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.errorBackground,
  padding: spacing.md,
  margin: spacing.lg,
  borderRadius: 8,
})

const $errorText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.error,
  fontSize: 14,
  fontFamily: typography.primary.medium,
})

const $paginationContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  position: "absolute",
  bottom: spacing.md,
  left: 0,
  right: 0,
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  gap: spacing.xs,
  zIndex: 10,
  paddingVertical: spacing.xs,
})

const $paginationDot: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: colors.palette.neutral400,
  opacity: 0.7,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.3,
  shadowRadius: 2,
  elevation: 3,
})

const $paginationDotActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  opacity: 1,
  transform: [{ scale: 1.2 }],
  shadowOpacity: 0.5,
})
