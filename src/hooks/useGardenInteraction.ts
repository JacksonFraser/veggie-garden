import { useState, useCallback } from 'react';
import { Plant, RaisedBed } from '@/types';

interface GardenInteractionState {
  selectedPlantType: string;
  isPlacing: boolean;
  isPlacingBed: boolean;
  selectedPlant: Plant | null;
  selectedBed: RaisedBed | null;
  showPlantPanel: boolean;
}

interface GardenInteractionActions {
  setSelectedPlantType: (plantType: string) => void;
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
  const [isPlacing, setIsPlacing] = useState(false);
  const [isPlacingBed, setIsPlacingBed] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [selectedBed, setSelectedBed] = useState<RaisedBed | null>(null);
  const [showPlantPanel, setShowPlantPanel] = useState(true);

  const startPlantPlacement = useCallback(() => {
    setIsPlacing(true);
    setIsPlacingBed(false);
    setSelectedPlant(null);
  }, []);

  const startBedPlacement = useCallback(() => {
    setIsPlacingBed(true);
    setIsPlacing(false);
    setSelectedBed(null);
  }, []);

  const stopPlacement = useCallback(() => {
    setIsPlacing(false);
    setIsPlacingBed(false);
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
    isPlacing,
    isPlacingBed,
    selectedPlant,
    selectedBed,
    showPlantPanel,
    // Actions
    setSelectedPlantType,
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
