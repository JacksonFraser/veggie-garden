import { Id, Doc } from '../../convex/_generated/dataModel';

// Core Convex document types
export type Garden = Doc<'gardens'>;
export type Plant = Doc<'plants'>;
export type PlantType = Doc<'plantTypes'>;
export type RaisedBed = Doc<'raisedBeds'>;

// ID types for better type safety
export type GardenId = Id<'gardens'>;
export type PlantId = Id<'plants'>;
export type PlantTypeId = Id<'plantTypes'>;
export type RaisedBedId = Id<'raisedBeds'>;

// Form/Input types are now exported from validation.ts with Zod inference

// Bed settings for placement UI
export interface BedSettings {
  name: string;
  width: number;
  height: number;
  bedHeight: number;
  material: 'wood' | 'stone' | 'metal' | 'composite';
  soilType: string;
}

// Optimistic types for UI updates before database confirms
export interface OptimisticRaisedBed {
  _id?: RaisedBedId;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  bedHeight: number;
  material: 'wood' | 'stone' | 'metal' | 'composite';
  color: string;
  soilType?: string;
}

// Result types for operations
export interface PlantPlacementResult {
  success: boolean;
  error?: string;
}

export interface BedPlacementResult {
  success: boolean;
  error?: string;
}

// Material colors mapping
export const MATERIAL_COLORS = {
  wood: '#8B4513',
  stone: '#696969',
  metal: '#708090',
  composite: '#654321',
} as const;

// Canvas/UI constants
export const CANVAS_SCALE = 30;
export const GRID_SIZE = 1; // 1 meter grid
export const MIN_PLANT_SIZE = 0.05; // 5cm minimum plant size

// Plant status colors
export const STATUS_COLORS = {
  planned: '#94a3b8',
  planted: '#10b981',
  growing: '#22c55e',
  harvested: '#f59e0b',
} as const;

// Validation helpers
export function isValidCoordinate(value: number): boolean {
  return typeof value === 'number' && !isNaN(value) && value >= 0;
}

export function isValidDimension(value: number): boolean {
  return typeof value === 'number' && !isNaN(value) && value > 0;
}

export function isValidPlantStatus(
  status: string
): status is 'planned' | 'planted' | 'growing' | 'harvested' {
  return ['planned', 'planted', 'growing', 'harvested'].includes(status);
}

export function isValidMaterial(
  material: string
): material is 'wood' | 'stone' | 'metal' | 'composite' {
  return ['wood', 'stone', 'metal', 'composite'].includes(material);
}
