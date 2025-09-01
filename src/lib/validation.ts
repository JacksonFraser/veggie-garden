import { z } from 'zod';

// Basic validation building blocks
const coordinateSchema = z.number().min(0, 'Must be >= 0').finite('Must be a valid number');
const dimensionSchema = z.number().min(0, 'Must be positive').finite('Must be a valid number');
const hexColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color (e.g., #10b981)');
const plantStatusSchema = z.enum(['planned', 'planted', 'growing', 'harvested']);
const materialSchema = z.enum(['wood', 'stone', 'metal', 'composite']);

// Garden creation validation
export const gardenCreationSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Garden name is required')
    .max(100, 'Garden name must be less than 100 characters'),
  width: dimensionSchema
    .min(0.5, 'Garden width must be at least 0.5 meters')
    .max(100, 'Garden width cannot exceed 100 meters'),
  height: dimensionSchema
    .min(0.5, 'Garden height must be at least 0.5 meters')
    .max(100, 'Garden height cannot exceed 100 meters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
});

// Raised bed settings validation
export const bedSettingsSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Bed name is required')
    .max(50, 'Bed name must be less than 50 characters'),
  width: dimensionSchema
    .min(0.3, 'Bed width must be at least 0.3 meters')
    .max(10, 'Bed width cannot exceed 10 meters'),
  height: dimensionSchema
    .min(0.3, 'Bed height must be at least 0.3 meters')
    .max(10, 'Bed height cannot exceed 10 meters'),
  bedHeight: dimensionSchema
    .min(0.1, 'Bed height must be at least 0.1 meters')
    .max(1.5, 'Bed height cannot exceed 1.5 meters'),
  material: materialSchema,
  soilType: z.string()
    .max(100, 'Soil type must be less than 100 characters')
    .optional()
});

// Plant placement validation
export const plantPlacementSchema = z.object({
  x: coordinateSchema,
  y: coordinateSchema,
  plantTypeName: z.string().min(1, 'Plant type is required')
});

// Coordinate bounds validation
export const coordinateBoundsSchema = z.object({
  x: coordinateSchema,
  y: coordinateSchema,
  width: dimensionSchema,
  height: dimensionSchema,
  gardenWidth: dimensionSchema,
  gardenHeight: dimensionSchema
}).refine(
  (data) => data.x + data.width <= data.gardenWidth,
  { message: 'Item extends beyond garden width', path: ['x'] }
).refine(
  (data) => data.y + data.height <= data.gardenHeight,
  { message: 'Item extends beyond garden height', path: ['y'] }
);

// Type inference
export type GardenCreationInput = z.infer<typeof gardenCreationSchema>;
export type BedSettingsInput = z.infer<typeof bedSettingsSchema>;
export type PlantPlacementInput = z.infer<typeof plantPlacementSchema>;

// Validation functions
export function validateGardenCreation(input: unknown) {
  return gardenCreationSchema.parse(input);
}

export function validateBedSettings(input: unknown) {
  return bedSettingsSchema.parse(input);
}

export function validatePlantPlacement(input: unknown) {
  return plantPlacementSchema.parse(input);
}

export function validateCoordinateBounds(input: unknown) {
  return coordinateBoundsSchema.parse(input);
}

// Safe validation functions (return results instead of throwing)
export function safeValidateGardenCreation(input: unknown) {
  return gardenCreationSchema.safeParse(input);
}

export function safeValidateBedSettings(input: unknown) {
  return bedSettingsSchema.safeParse(input);
}

export function safeValidatePlantPlacement(input: unknown) {
  return plantPlacementSchema.safeParse(input);
}

// Error formatting helper
export function formatZodError(error: z.ZodError): string[] {
  return error.issues.map(issue => {
    const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
    return `${path}${issue.message}`;
  });
}

// Quick validation helpers for common cases
export function isValidMaterial(value: unknown): value is 'wood' | 'stone' | 'metal' | 'composite' {
  return materialSchema.safeParse(value).success;
}

export function isValidPlantStatus(value: unknown): value is 'planned' | 'planted' | 'growing' | 'harvested' {
  return plantStatusSchema.safeParse(value).success;
}

export function isValidHexColor(value: unknown): value is string {
  return hexColorSchema.safeParse(value).success;
}