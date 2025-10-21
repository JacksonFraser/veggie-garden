import { useState, useCallback } from 'react';
import { useCreateRaisedBed } from '@/lib/convex-hooks';
import {
  Garden,
  BedSettings,
  BedPlacementResult,
  MATERIAL_COLORS,
  OptimisticRaisedBed,
} from '@/types';
import { GardenId } from '@/types';
import {
  safeValidateBedSettings,
  formatZodError,
  validateCoordinateBounds,
} from '@/lib/validation';

interface UseRaisedBedPlacementProps {
  gardenId: GardenId;
  garden: Garden | null | undefined;
}

interface UseRaisedBedPlacementReturn {
  newBedSettings: BedSettings;
  optimisticBeds: OptimisticRaisedBed[];
  setNewBedSettings: React.Dispatch<React.SetStateAction<BedSettings>>;
  placeBed: (x: number, y: number) => Promise<BedPlacementResult>;
  getMaterialColor: (material: 'wood' | 'stone' | 'metal' | 'composite') => string;
  validationErrors: string[];
  validateCurrentSettings: () => boolean;
}

export function useRaisedBedPlacement({
  gardenId,
  garden,
}: UseRaisedBedPlacementProps): UseRaisedBedPlacementReturn {
  const createRaisedBed = useCreateRaisedBed();
  const [optimisticBeds, setOptimisticBeds] = useState<OptimisticRaisedBed[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const [newBedSettings, setNewBedSettings] = useState<BedSettings>({
    name: 'New Bed',
    width: 1.2,
    height: 2.4,
    bedHeight: 0.3,
    material: 'wood',
    soilType: 'garden soil',
  });

  const getMaterialColor = useCallback((material: 'wood' | 'stone' | 'metal' | 'composite') => {
    return MATERIAL_COLORS[material];
  }, []);

  const validateCurrentSettings = useCallback(() => {
    setValidationErrors([]);

    const validation = safeValidateBedSettings(newBedSettings);
    if (!validation.success) {
      setValidationErrors(formatZodError(validation.error));
      return false;
    }

    return true;
  }, [newBedSettings]);

  const placeBed = useCallback(
    async (x: number, y: number): Promise<BedPlacementResult> => {
      if (!garden) {
        return { success: false, error: 'Garden not loaded' };
      }

      // Validate bed settings first
      if (!validateCurrentSettings()) {
        return { success: false, error: 'Invalid bed settings. Please fix the errors above.' };
      }

      // Validate bounds with Zod
      try {
        validateCoordinateBounds({
          x,
          y,
          width: newBedSettings.width,
          height: newBedSettings.height,
          gardenWidth: garden.width,
          gardenHeight: garden.height,
        });
      } catch {
        return { success: false, error: 'Bed placement is outside garden bounds' };
      }

      const color = getMaterialColor(newBedSettings.material);
      const roundedX = Math.round(x * 4) / 4;
      const roundedY = Math.round(y * 4) / 4;

      // Create optimistic bed for instant UI feedback
      const optimisticBed: OptimisticRaisedBed = {
        name: newBedSettings.name,
        x: roundedX,
        y: roundedY,
        width: newBedSettings.width,
        height: newBedSettings.height,
        bedHeight: newBedSettings.bedHeight,
        material: newBedSettings.material,
        color: color,
        soilType: newBedSettings.soilType,
      };

      // Add to optimistic state for instant feedback
      setOptimisticBeds((prev) => [...prev, optimisticBed]);

      try {
        // Create the actual bed (async)
        await createRaisedBed.mutateAsync({
          gardenId,
          name: newBedSettings.name,
          x: roundedX,
          y: roundedY,
          width: newBedSettings.width,
          height: newBedSettings.height,
          bedHeight: newBedSettings.bedHeight,
          material: newBedSettings.material,
          color: color,
          soilType: newBedSettings.soilType,
        });

        // Remove from optimistic state once real bed is created
        setOptimisticBeds((prev) =>
          prev.filter(
            (b) => !(b.x === roundedX && b.y === roundedY && b.name === optimisticBed.name)
          )
        );

        return { success: true };
      } catch (error) {
        console.error('Error placing bed:', error);

        // Remove optimistic bed on error
        setOptimisticBeds((prev) =>
          prev.filter(
            (b) => !(b.x === roundedX && b.y === roundedY && b.name === optimisticBed.name)
          )
        );

        return { success: false, error: 'Failed to create raised bed' };
      }
    },
    [garden, gardenId, newBedSettings, getMaterialColor, createRaisedBed, validateCurrentSettings]
  );

  return {
    newBedSettings,
    optimisticBeds,
    setNewBedSettings,
    placeBed,
    getMaterialColor,
    validationErrors,
    validateCurrentSettings,
  };
}
