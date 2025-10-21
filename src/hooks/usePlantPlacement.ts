import { useCallback } from 'react';
import { useCreatePlant, usePlantTypes } from '@/lib/convex-hooks';
import { RaisedBed, Garden, PlantPlacementResult, PlantType } from '@/types';
import { GardenId } from '@/types';
import { safeValidatePlantPlacement, validateCoordinateBounds } from '@/lib/validation';

interface UsePlantPlacementProps {
  gardenId: GardenId;
  garden: Garden | null | undefined;
  raisedBeds: RaisedBed[] | undefined;
}

interface UsePlantPlacementReturn {
  placePlant: (x: number, y: number, plantTypeName: string) => Promise<PlantPlacementResult>;
  getPlantType: (name: string) => PlantType | undefined;
  isPointInBed: (x: number, y: number, bed: RaisedBed) => boolean;
  findBedAtPoint: (x: number, y: number) => RaisedBed | undefined;
}

export function usePlantPlacement({
  gardenId,
  garden,
  raisedBeds,
}: UsePlantPlacementProps): UsePlantPlacementReturn {
  const { data: plantTypes } = usePlantTypes();
  const createPlant = useCreatePlant();

  const getPlantType = useCallback(
    (name: string) => {
      return plantTypes?.find((pt) => pt.name === name);
    },
    [plantTypes]
  );

  const isPointInBed = useCallback((x: number, y: number, bed: RaisedBed) => {
    return x >= bed.x && x <= bed.x + bed.width && y >= bed.y && y <= bed.y + bed.height;
  }, []);

  const findBedAtPoint = useCallback(
    (x: number, y: number) => {
      return raisedBeds?.find((bed) => isPointInBed(x, y, bed));
    },
    [raisedBeds, isPointInBed]
  );

  const placePlant = useCallback(
    async (x: number, y: number, plantTypeName: string): Promise<PlantPlacementResult> => {
      if (!garden) {
        return { success: false, error: 'Garden not loaded' };
      }

      // Validate input parameters with Zod
      const placementValidation = safeValidatePlantPlacement({ x, y, plantTypeName });
      if (!placementValidation.success) {
        return { success: false, error: 'Invalid placement parameters' };
      }

      const plantType = getPlantType(plantTypeName);
      if (!plantType) {
        return { success: false, error: 'Plant type not found' };
      }

      const spacing = plantType.spacing / 100;
      const plantWidth = Math.max(spacing, 0.05);
      const plantHeight = Math.max(spacing, 0.05);

      // Validate bounds with Zod
      try {
        validateCoordinateBounds({
          x,
          y,
          width: plantWidth,
          height: plantHeight,
          gardenWidth: garden.width,
          gardenHeight: garden.height,
        });
      } catch {
        return { success: false, error: 'Plant placement is outside garden bounds' };
      }

      // Find which bed (if any) this plant is being placed in
      const bed = findBedAtPoint(x + plantWidth / 2, y + plantHeight / 2);

      // Round coordinates to quarter precision
      const roundedX = Math.round(x * 4) / 4;
      const roundedY = Math.round(y * 4) / 4;

      try {
        if (bed) {
          // If placing in a bed, make sure it fits entirely within the bed
          if (
            x >= bed.x &&
            x + plantWidth <= bed.x + bed.width &&
            y >= bed.y &&
            y + plantHeight <= bed.y + bed.height
          ) {
            await createPlant.mutateAsync({
              gardenId,
              raisedBedId: bed._id,
              name: plantType.name,
              variety: plantType.name,
              x: roundedX,
              y: roundedY,
              width: plantWidth,
              height: plantHeight,
              color: plantType.color,
              status: 'planned',
            });
          } else {
            return { success: false, error: 'Plant does not fit entirely within the bed' };
          }
        } else {
          // Placing directly in garden soil (no raised bed)
          await createPlant.mutateAsync({
            gardenId,
            name: plantType.name,
            variety: plantType.name,
            x: roundedX,
            y: roundedY,
            width: plantWidth,
            height: plantHeight,
            color: plantType.color,
            status: 'planned',
          });
        }

        return { success: true };
      } catch (error) {
        console.error('Error placing plant:', error);
        return { success: false, error: 'Failed to create plant' };
      }
    },
    [garden, gardenId, getPlantType, findBedAtPoint, createPlant]
  );

  return {
    placePlant,
    getPlantType,
    isPointInBed,
    findBedAtPoint,
  };
}
