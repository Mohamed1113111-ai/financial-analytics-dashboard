import React, { createContext, useContext, useState, useCallback } from "react";

export interface Location {
  id: number;
  name: string;
  code: string;
  region: string;
  isActive: boolean;
}

export interface LocationContextType {
  selectedLocations: number[];
  allLocations: Location[];
  toggleLocation: (locationId: number) => void;
  setSelectedLocations: (locationIds: number[]) => void;
  selectAllLocations: () => void;
  clearLocations: () => void;
  isLocationSelected: (locationId: number) => boolean;
  getSelectedLocationNames: () => string[];
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Mock locations - in production these would come from the database
const MOCK_LOCATIONS: Location[] = [
  { id: 1, name: "New York", code: "NY", region: "Northeast", isActive: true },
  { id: 2, name: "Los Angeles", code: "LA", region: "West", isActive: true },
  { id: 3, name: "Chicago", code: "CHI", region: "Midwest", isActive: true },
  { id: 4, name: "Houston", code: "HOU", region: "South", isActive: true },
  { id: 5, name: "Miami", code: "MIA", region: "Southeast", isActive: true },
  { id: 6, name: "Seattle", code: "SEA", region: "Northwest", isActive: true },
];

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedLocations, setSelectedLocations] = useState<number[]>([1, 2, 3]); // Default to first 3

  const toggleLocation = useCallback((locationId: number) => {
    setSelectedLocations((prev) =>
      prev.includes(locationId)
        ? prev.filter((id) => id !== locationId)
        : [...prev, locationId]
    );
  }, []);

  const selectAllLocations = useCallback(() => {
    setSelectedLocations(MOCK_LOCATIONS.map((loc) => loc.id));
  }, []);

  const clearLocations = useCallback(() => {
    setSelectedLocations([]);
  }, []);

  const isLocationSelected = useCallback(
    (locationId: number) => selectedLocations.includes(locationId),
    [selectedLocations]
  );

  const getSelectedLocationNames = useCallback(() => {
    return selectedLocations
      .map((id) => MOCK_LOCATIONS.find((loc) => loc.id === id)?.name || "")
      .filter(Boolean);
  }, [selectedLocations]);

  const value: LocationContextType = {
    selectedLocations,
    allLocations: MOCK_LOCATIONS,
    toggleLocation,
    setSelectedLocations,
    selectAllLocations,
    clearLocations,
    isLocationSelected,
    getSelectedLocationNames,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within LocationProvider");
  }
  return context;
};
