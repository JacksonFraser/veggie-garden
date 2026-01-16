import { useState, useCallback } from 'react';
import { Plant, RaisedBed } from '@/types';

// State machine for placement mode - eliminates impossible states
type PlacementMode = 'none' | 'plant' | 'bed';

interface GardenInteractionState {
  selectedPlantType: string;
  placementMode: PlacementMode;
  // Derived state for backwards compatibility
  isPlacing: boolean;
  isPlacingBed: boolean;
  selectedPlant: Plant | null;
  selectedBed: RaisedBed | null;
  showPlantPanel: boolean;
}

interface GardenInteractionActions {
  setSelectedPlantType: (plantType: string) => void;
  setPlacementMode: (mode: PlacementMode) => void;
  // Keep these for backwards compatibility, but they now use the state machine
  setIsPlacing: (placing: boolean) => void;
  setIsPlacingBed: (placing: boolean) => void;
  setSelectedPlant: (plant: Plant | null) => void;
  setSelectedBed: (bed: RaisedBed | null) => void;
  setShowPlantPanel: (show: boolean) => void;
  startPlantPlacement: () => void;
  startBedPlacement: () => void;
  stopPlacement: () => void;
  selectPlant: (plant: Plant | null) => void;
  selectBed: (bed: RaisedBed) => void;
  clearSelection: () => void;
}

interface UseGardenInteractionReturn extends GardenInteractionState, GardenInteractionActions {}

export function useGardenInteraction(): UseGardenInteractionReturn {
  const [selectedPlantType, setSelectedPlantType] = useState<string>('');
  const [placementMode, setPlacementMode] = useState<PlacementMode>('none');
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [selectedBed, setSelectedBed] = useState<RaisedBed | null>(null);
  const [showPlantPanel, setShowPlantPanel] = useState(true);

  // Derived state from placement mode
  const isPlacing = placementMode === 'plant';
  const isPlacingBed = placementMode === 'bed';

  // Backwards compatibility setters that use the state machine
  const setIsPlacing = useCallback((placing: boolean) => {
    setPlacementMode(placing ? 'plant' : 'none');
  }, []);

  const setIsPlacingBed = useCallback((placing: boolean) => {
    setPlacementMode(placing ? 'bed' : 'none');
  }, []);

  const startPlantPlacement = useCallback(() => {
    setPlacementMode('plant');
    setSelectedPlant(null);
  }, []);

  const startBedPlacement = useCallback(() => {
    setPlacementMode('bed');
    setSelectedBed(null);
  }, []);

  const stopPlacement = useCallback(() => {
    setPlacementMode('none');
  }, []);

  const selectPlant = useCallback((plant: Plant | null) => {
    setSelectedPlant(plant);
    setSelectedBed(null);
  }, []);

  const selectBed = useCallback((bed: RaisedBed) => {
    setSelectedBed(bed);
    setSelectedPlant(null);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedPlant(null);
    setSelectedBed(null);
  }, []);

  return {
    // State
    selectedPlantType,
    placementMode,
    isPlacing,
    isPlacingBed,
    selectedPlant,
    selectedBed,
    showPlantPanel,
    // Actions
    setSelectedPlantType,
    setPlacementMode,
    setIsPlacing,
    setIsPlacingBed,
    setSelectedPlant,
    setSelectedBed,
    setShowPlantPanel,
    startPlantPlacement,
    startBedPlacement,
    stopPlacement,
    selectPlant,
    selectBed,
    clearSelection,
  };
}
