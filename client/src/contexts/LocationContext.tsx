import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { trpc } from "@/lib/trpc";

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
  isLoading: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedLocations, setSelectedLocations] = useState<number[]>([7, 8, 9, 10, 11, 12, 13]); // Default to Saudi Arabia & UAE locations
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch locations from database
  const { data: locationsData } = trpc.locations.list.useQuery();

  useEffect(() => {
    if (locationsData) {
      const formattedLocations: Location[] = locationsData.map((loc: any) => ({
        id: loc.id,
        name: loc.name,
        code: loc.code,
        region: loc.region,
        isActive: loc.status === "active",
      }));
      setAllLocations(formattedLocations);
      setIsLoading(false);
    }
  }, [locationsData]);

  const toggleLocation = useCallback((locationId: number) => {
    setSelectedLocations((prev) =>
      prev.includes(locationId)
        ? prev.filter((id) => id !== locationId)
        : [...prev, locationId]
    );
  }, []);

  const selectAllLocations = useCallback(() => {
    setSelectedLocations(allLocations.map((loc) => loc.id));
  }, [allLocations]);

  const clearLocations = useCallback(() => {
    setSelectedLocations([]);
  }, []);

  const isLocationSelected = useCallback(
    (locationId: number) => selectedLocations.includes(locationId),
    [selectedLocations]
  );

  const getSelectedLocationNames = useCallback(() => {
    return selectedLocations
      .map((id) => allLocations.find((loc) => loc.id === id)?.name || "")
      .filter(Boolean);
  }, [selectedLocations, allLocations]);

  const value: LocationContextType = {
    selectedLocations,
    allLocations,
    toggleLocation,
    setSelectedLocations,
    selectAllLocations,
    clearLocations,
    isLocationSelected,
    getSelectedLocationNames,
    isLoading,
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
