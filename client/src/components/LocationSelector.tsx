import { useLocation } from "@/contexts/LocationContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { MapPin, ChevronDown } from "lucide-react";

export default function LocationSelector() {
  const {
    selectedLocations,
    allLocations,
    toggleLocation,
    selectAllLocations,
    clearLocations,
    getSelectedLocationNames,
  } = useLocation();

  const selectedNames = getSelectedLocationNames();
  const displayText =
    selectedLocations.length === 0
      ? "No locations"
      : selectedLocations.length === 1
        ? selectedNames[0]
        : selectedLocations.length === allLocations.length
          ? "All locations"
          : `${selectedLocations.length} locations`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-background hover:bg-muted"
        >
          <MapPin className="h-4 w-4" />
          <span className="hidden sm:inline">{displayText}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56" side="bottom">
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
          SELECT LOCATIONS
        </DropdownMenuLabel>

        <div className="max-h-64 overflow-y-auto">
          {allLocations.map((location) => (
            <DropdownMenuCheckboxItem
              key={location.id}
              checked={selectedLocations.includes(location.id)}
              onCheckedChange={() => toggleLocation(location.id)}
              className="cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="font-medium">{location.name}</span>
                <span className="text-xs text-muted-foreground">{location.region}</span>
              </div>
            </DropdownMenuCheckboxItem>
          ))}
        </div>

        <DropdownMenuSeparator />

        <div className="flex gap-2 p-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={selectAllLocations}
          >
            All
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={clearLocations}
          >
            Clear
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
