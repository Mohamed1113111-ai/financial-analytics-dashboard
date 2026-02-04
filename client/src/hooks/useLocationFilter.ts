import { useLocation } from "@/contexts/LocationContext";

/**
 * Hook to get location filter parameters for tRPC queries
 * Returns an object that can be spread into tRPC procedure inputs
 */
export const useLocationFilterParams = () => {
  const { selectedLocations } = useLocation();

  return {
    locationIds: selectedLocations,
    hasMultipleLocations: selectedLocations.length > 1,
    isSingleLocation: selectedLocations.length === 1,
  };
};

/**
 * Hook to format location filter for display
 */
export const useLocationFilterDisplay = () => {
  const { selectedLocations, getSelectedLocationNames, allLocations } = useLocation();

  return {
    displayText:
      selectedLocations.length === 0
        ? "No locations selected"
        : selectedLocations.length === 1
          ? getSelectedLocationNames()[0]
          : selectedLocations.length === allLocations.length
            ? "All locations"
            : `${selectedLocations.length} locations`,
    selectedCount: selectedLocations.length,
    totalCount: allLocations.length,
  };
};

/**
 * Hook to check if location filter is active (not all locations selected)
 */
export const useIsLocationFilterActive = () => {
  const { selectedLocations, allLocations } = useLocation();
  return selectedLocations.length > 0 && selectedLocations.length < allLocations.length;
};
