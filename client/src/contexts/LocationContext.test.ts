import { describe, expect, it, beforeEach, vi } from "vitest";

// Mock location context data
const MOCK_LOCATIONS = [
  { id: 1, name: "New York", code: "NY", region: "Northeast", isActive: true },
  { id: 2, name: "Los Angeles", code: "LA", region: "West", isActive: true },
  { id: 3, name: "Chicago", code: "CHI", region: "Midwest", isActive: true },
  { id: 4, name: "Houston", code: "HOU", region: "South", isActive: true },
  { id: 5, name: "Miami", code: "MIA", region: "Southeast", isActive: true },
  { id: 6, name: "Seattle", code: "SEA", region: "Northwest", isActive: true },
];

describe("Location Filtering", () => {
  describe("Location Selection", () => {
    it("should toggle location selection", () => {
      let selectedLocations = [1, 2];

      // Toggle location 1 (remove)
      selectedLocations = selectedLocations.filter((id) => id !== 1);
      expect(selectedLocations).toEqual([2]);

      // Toggle location 3 (add)
      selectedLocations = [...selectedLocations, 3];
      expect(selectedLocations).toEqual([2, 3]);
    });

    it("should select all locations", () => {
      const selectedLocations = MOCK_LOCATIONS.map((loc) => loc.id);
      expect(selectedLocations).toEqual([1, 2, 3, 4, 5, 6]);
      expect(selectedLocations.length).toBe(MOCK_LOCATIONS.length);
    });

    it("should clear all locations", () => {
      let selectedLocations = [1, 2, 3];
      selectedLocations = [];
      expect(selectedLocations).toEqual([]);
    });
  });

  describe("Location Display", () => {
    it("should display single location name", () => {
      const selectedLocations = [1];
      const selectedNames = selectedLocations
        .map((id) => MOCK_LOCATIONS.find((loc) => loc.id === id)?.name || "")
        .filter(Boolean);

      expect(selectedNames).toEqual(["New York"]);
    });

    it("should display multiple location count", () => {
      const selectedLocations = [1, 2, 3];
      const displayText = `${selectedLocations.length} locations`;
      expect(displayText).toBe("3 locations");
    });

    it("should display 'All locations' when all selected", () => {
      const selectedLocations = MOCK_LOCATIONS.map((loc) => loc.id);
      const isAllSelected = selectedLocations.length === MOCK_LOCATIONS.length;
      const displayText = isAllSelected ? "All locations" : `${selectedLocations.length} locations`;
      expect(displayText).toBe("All locations");
    });

    it("should display 'No locations' when none selected", () => {
      const selectedLocations: number[] = [];
      const displayText = selectedLocations.length === 0 ? "No locations" : `${selectedLocations.length} locations`;
      expect(displayText).toBe("No locations");
    });
  });

  describe("Location Filtering", () => {
    it("should check if location is selected", () => {
      const selectedLocations = [1, 3, 5];

      expect(selectedLocations.includes(1)).toBe(true);
      expect(selectedLocations.includes(2)).toBe(false);
      expect(selectedLocations.includes(3)).toBe(true);
    });

    it("should get selected location names", () => {
      const selectedLocations = [1, 3, 5];
      const selectedNames = selectedLocations
        .map((id) => MOCK_LOCATIONS.find((loc) => loc.id === id)?.name || "")
        .filter(Boolean);

      expect(selectedNames).toEqual(["New York", "Chicago", "Miami"]);
    });

    it("should filter data by selected locations", () => {
      const selectedLocations = [1, 2];
      const data = [
        { location: "New York", value: 100 },
        { location: "Los Angeles", value: 200 },
        { location: "Chicago", value: 300 },
      ];

      const filteredData = data.filter((item) =>
        selectedLocations.some((locId) => item.location.includes(MOCK_LOCATIONS[locId - 1].name))
      );

      expect(filteredData).toEqual([
        { location: "New York", value: 100 },
        { location: "Los Angeles", value: 200 },
      ]);
    });
  });

  describe("Location Filter Status", () => {
    it("should identify when filter is active (not all selected)", () => {
      const selectedLocations = [1, 2, 3];
      const isFilterActive = selectedLocations.length > 0 && selectedLocations.length < MOCK_LOCATIONS.length;
      expect(isFilterActive).toBe(true);
    });

    it("should identify when filter is inactive (all selected)", () => {
      const selectedLocations = MOCK_LOCATIONS.map((loc) => loc.id);
      const isFilterActive = selectedLocations.length > 0 && selectedLocations.length < MOCK_LOCATIONS.length;
      expect(isFilterActive).toBe(false);
    });

    it("should identify when no locations selected", () => {
      const selectedLocations: number[] = [];
      const isFilterActive = selectedLocations.length > 0 && selectedLocations.length < MOCK_LOCATIONS.length;
      expect(isFilterActive).toBe(false);
    });
  });

  describe("Multi-Location Analysis", () => {
    it("should identify single location selection", () => {
      const selectedLocations = [1];
      const isSingleLocation = selectedLocations.length === 1;
      expect(isSingleLocation).toBe(true);
    });

    it("should identify multiple location selection", () => {
      const selectedLocations = [1, 2, 3];
      const hasMultipleLocations = selectedLocations.length > 1;
      expect(hasMultipleLocations).toBe(true);
    });

    it("should get location filter parameters", () => {
      const selectedLocations = [1, 2, 3];
      const filterParams = {
        locationIds: selectedLocations,
        hasMultipleLocations: selectedLocations.length > 1,
        isSingleLocation: selectedLocations.length === 1,
      };

      expect(filterParams.locationIds).toEqual([1, 2, 3]);
      expect(filterParams.hasMultipleLocations).toBe(true);
      expect(filterParams.isSingleLocation).toBe(false);
    });
  });

  describe("Region-Based Filtering", () => {
    it("should filter locations by region", () => {
      const selectedRegion = "Northeast";
      const regionLocations = MOCK_LOCATIONS.filter((loc) => loc.region === selectedRegion);
      expect(regionLocations).toEqual([{ id: 1, name: "New York", code: "NY", region: "Northeast", isActive: true }]);
    });

    it("should get all regions", () => {
      const regions = [...new Set(MOCK_LOCATIONS.map((loc) => loc.region))];
      expect(regions).toEqual(["Northeast", "West", "Midwest", "South", "Southeast", "Northwest"]);
    });

    it("should select all locations in a region", () => {
      const selectedRegion = "West";
      const regionLocationIds = MOCK_LOCATIONS.filter((loc) => loc.region === selectedRegion).map((loc) => loc.id);
      expect(regionLocationIds).toEqual([2]);
    });
  });

  describe("Location Status", () => {
    it("should identify active locations", () => {
      const activeLocations = MOCK_LOCATIONS.filter((loc) => loc.isActive);
      expect(activeLocations.length).toBe(6);
    });

    it("should exclude inactive locations from selection", () => {
      const inactiveLocations = MOCK_LOCATIONS.filter((loc) => !loc.isActive);
      expect(inactiveLocations.length).toBe(0);
    });
  });

  describe("Location Code Lookup", () => {
    it("should get location by code", () => {
      const code = "NY";
      const location = MOCK_LOCATIONS.find((loc) => loc.code === code);
      expect(location).toEqual({ id: 1, name: "New York", code: "NY", region: "Northeast", isActive: true });
    });

    it("should get location codes for selected locations", () => {
      const selectedLocations = [1, 3, 5];
      const codes = selectedLocations
        .map((id) => MOCK_LOCATIONS.find((loc) => loc.id === id)?.code || "")
        .filter(Boolean);

      expect(codes).toEqual(["NY", "CHI", "MIA"]);
    });
  });
});
