// Re-export types from centralized location
export type {
  Garden,
  Plant,
  PlantType,
  RaisedBed,
  GardenId,
  PlantId,
  PlantTypeId,
  RaisedBedId,
  BedSettings,
  PlantPlacementResult,
  BedPlacementResult,
  OptimisticRaisedBed,
} from '@/types';

export {
  MATERIAL_COLORS,
  CANVAS_SCALE,
  GRID_SIZE,
  MIN_PLANT_SIZE,
  STATUS_COLORS,
  isValidCoordinate,
  isValidDimension,
  isValidPlantStatus,
  isValidMaterial,
} from '@/types';

// Re-import for legacy aliases
import type { Plant, RaisedBed } from '@/types';

// Legacy aliases for backward compatibility (temporary)
export type PlantInstance = Plant;
export type RaisedBedInstance = RaisedBed;
