'use client';

import {
  useGarden,
  usePlantsByGarden,
  useRaisedBedsByGarden,
  usePlantTypes,
  useDeletePlant,
  useDeleteRaisedBed,
} from '@/lib/convex-hooks';
import { useRef } from 'react';
import {
  useGardenInteraction,
  usePlantPlacement,
  useRaisedBedPlacement,
  usePlantDragging,
  useCanvasDrawing,
} from '@/hooks';
import { GardenButton } from '@/components/ui';

import { GardenId, CANVAS_SCALE } from '@/types';
import { isValidMaterial } from '@/lib/validation';

interface GardenDesignerProps {
  gardenId: string;
}

export function GardenDesigner({ gardenId }: GardenDesignerProps) {
  const { data: garden } = useGarden(gardenId as GardenId);
  const { data: plants } = usePlantsByGarden(gardenId as GardenId);
  const { data: raisedBeds } = useRaisedBedsByGarden(gardenId as GardenId);
  const { data: plantTypes } = usePlantTypes();
  const deletePlant = useDeletePlant();
  const deleteRaisedBed = useDeleteRaisedBed();

  // Custom hooks for component logic
  const interaction = useGardenInteraction();
  const plantPlacement = usePlantPlacement({ gardenId: gardenId as GardenId, garden, raisedBeds });
  const bedPlacement = useRaisedBedPlacement({ gardenId: gardenId as GardenId, garden });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Sets up canvas drawing with useEffect inside the hook
  useCanvasDrawing({
    canvasRef,
    garden,
    plants,
    raisedBeds,
    optimisticBeds: bedPlacement.optimisticBeds,
    selectedPlant: interaction.selectedPlant,
    selectedBed: interaction.selectedBed,
    isDragging: false, // will be updated when dragging starts
    scale: CANVAS_SCALE,
  });
  const plantDragging = usePlantDragging({
    garden,
    plants,
    selectedPlant: interaction.selectedPlant,
    setSelectedPlant: interaction.selectPlant,
    scale: CANVAS_SCALE,
  });

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!garden || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / CANVAS_SCALE;
    const y = (e.clientY - rect.top) / CANVAS_SCALE;

    if (interaction.isPlacingBed) {
      bedPlacement.placeBed(x, y);
    } else if (interaction.isPlacing && interaction.selectedPlantType) {
      plantPlacement.placePlant(x, y, interaction.selectedPlantType);
    } else {
      // Selection mode - check for beds first, then plants
      const clickedBed = raisedBeds?.find((bed) => {
        return x >= bed.x && x <= bed.x + bed.width && y >= bed.y && y <= bed.y + bed.height;
      });

      const clickedPlant = plants?.find((plant) => {
        return (
          x >= plant.x && x <= plant.x + plant.width && y >= plant.y && y <= plant.y + plant.height
        );
      });

      if (clickedPlant) {
        interaction.selectPlant(clickedPlant);
      } else if (clickedBed) {
        interaction.selectBed(clickedBed);
      } else {
        interaction.clearSelection();
      }
    }
  };

  if (!garden)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <span className="animate-gentle-pulse mb-4 block text-6xl">🌱</span>
          <p className="text-xl text-gray-600">Loading your garden...</p>
        </div>
      </div>
    );

  return (
    <div className="flex gap-10">
      <div className="flex-1">
        <div className="card-garden-panel p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-4xl">🌿</span>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{garden.name}</h2>
                  <p className="text-gray-600">Garden Design Canvas</p>
                </div>
              </div>
              <div className="badge-garden">
                <div className="text-center">
                  <div className="text-sm font-semibold text-green-800">Dimensions</div>
                  <div className="text-lg font-bold text-green-900">
                    {garden.width}m × {garden.height}m
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="garden-canvas garden-grid mb-8 overflow-auto">
            <canvas
              ref={canvasRef}
              className="cursor-crosshair"
              onClick={handleCanvasClick}
              onMouseDown={(e) => plantDragging.startDrag(e, canvasRef)}
              onMouseMove={(e) => plantDragging.updateDrag(e, canvasRef)}
              onMouseUp={plantDragging.endDrag}
              onMouseLeave={plantDragging.endDrag}
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <GardenButton
              variant={interaction.isPlacing ? 'danger' : 'primary'}
              icon={<span className="text-lg">{interaction.isPlacing ? '❌' : '🌱'}</span>}
              onClick={() => {
                if (interaction.isPlacing) {
                  interaction.stopPlacement();
                } else {
                  interaction.startPlantPlacement();
                }
              }}
            >
              {interaction.isPlacing ? 'Stop Placing' : 'Place Plants'}
            </GardenButton>

            <GardenButton
              variant={interaction.isPlacingBed ? 'danger' : 'amber'}
              icon={<span className="text-lg">{interaction.isPlacingBed ? '❌' : '🪴'}</span>}
              onClick={() => {
                if (interaction.isPlacingBed) {
                  interaction.stopPlacement();
                } else {
                  interaction.startBedPlacement();
                }
              }}
            >
              {interaction.isPlacingBed ? 'Stop Placing' : 'Add Raised Bed'}
            </GardenButton>

            {interaction.selectedPlant && (
              <GardenButton
                variant="danger"
                icon={<span className="text-lg">🗑️</span>}
                onClick={() => {
                  if (interaction.selectedPlant?._id) {
                    deletePlant.mutate({ id: interaction.selectedPlant._id });
                    interaction.clearSelection();
                  }
                }}
              >
                Delete Plant
              </GardenButton>
            )}

            {interaction.selectedBed && (
              <GardenButton
                variant="danger"
                icon={<span className="text-lg">🗑️</span>}
                onClick={() => {
                  if (interaction.selectedBed?._id) {
                    deleteRaisedBed.mutate({ id: interaction.selectedBed._id });
                    interaction.clearSelection();
                  }
                }}
              >
                Delete Bed
              </GardenButton>
            )}
          </div>
        </div>
      </div>

      {interaction.showPlantPanel && (
        <div
          className="rounded-2xl border-2 border-green-200 bg-white/95 p-8 shadow-2xl backdrop-blur-sm"
          style={{ width: '380px' }}
        >
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🧑‍🌾</span>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Garden Tools</h3>
                <p className="text-sm text-gray-600">Design your perfect garden</p>
              </div>
            </div>
            <GardenButton
              variant="outline"
              size="sm"
              onClick={() => interaction.setShowPlantPanel(false)}
              className="h-10 w-10 p-0"
            >
              ✕
            </GardenButton>
          </div>

          {/* Raised Bed Settings */}
          {interaction.isPlacingBed && (
            <div className="mb-8 rounded-xl border-2 border-amber-200 bg-amber-50 p-6 shadow-lg">
              <div className="mb-4 flex items-center gap-3">
                <span className="text-3xl">🪴</span>
                <h4 className="text-lg font-bold text-amber-800">New Raised Bed</h4>
              </div>
              {bedPlacement.validationErrors.length > 0 && (
                <div className="mb-6 rounded-lg border-2 border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
                  <div className="mb-2 flex items-center gap-2">
                    <span>⚠️</span>
                    <strong>Fix these errors:</strong>
                  </div>
                  <ul className="ml-6 list-disc space-y-1">
                    {bedPlacement.validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="space-y-6">
                <div>
                  <label className="mb-3 block flex items-center gap-2 text-sm font-bold text-amber-800">
                    <span>🏷️</span>
                    Bed Name
                  </label>
                  <input
                    type="text"
                    value={bedPlacement.newBedSettings.name}
                    onChange={(e) =>
                      bedPlacement.setNewBedSettings((prev) => ({ ...prev, name: e.target.value }))
                    }
                    onBlur={bedPlacement.validateCurrentSettings}
                    className="w-full rounded-xl border-2 border-amber-300 px-4 py-3 transition-all focus:border-amber-500 focus:ring-4 focus:ring-amber-200"
                    placeholder="e.g. Herb Garden Bed"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-3 block flex items-center gap-1 text-sm font-bold text-amber-800">
                      <span>↔️</span>
                      Width (m)
                    </label>
                    <input
                      type="number"
                      value={bedPlacement.newBedSettings.width}
                      onChange={(e) =>
                        bedPlacement.setNewBedSettings((prev) => ({
                          ...prev,
                          width: Number(e.target.value),
                        }))
                      }
                      onBlur={bedPlacement.validateCurrentSettings}
                      className="w-full rounded-xl border-2 border-amber-300 px-4 py-3 transition-all focus:border-amber-500 focus:ring-4 focus:ring-amber-200"
                      min="0.3"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="mb-3 block flex items-center gap-1 text-sm font-bold text-amber-800">
                      <span>↕️</span>
                      Length (m)
                    </label>
                    <input
                      type="number"
                      value={bedPlacement.newBedSettings.height}
                      onChange={(e) =>
                        bedPlacement.setNewBedSettings((prev) => ({
                          ...prev,
                          height: Number(e.target.value),
                        }))
                      }
                      onBlur={bedPlacement.validateCurrentSettings}
                      className="w-full rounded-xl border-2 border-amber-300 px-4 py-3 transition-all focus:border-amber-500 focus:ring-4 focus:ring-amber-200"
                      min="0.3"
                      step="0.1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-3 block flex items-center gap-1 text-sm font-bold text-amber-800">
                      <span>⬆️</span>
                      Height (m)
                    </label>
                    <input
                      type="number"
                      value={bedPlacement.newBedSettings.bedHeight}
                      onChange={(e) =>
                        bedPlacement.setNewBedSettings((prev) => ({
                          ...prev,
                          bedHeight: Number(e.target.value),
                        }))
                      }
                      onBlur={bedPlacement.validateCurrentSettings}
                      className="w-full rounded-xl border-2 border-amber-300 px-4 py-3 transition-all focus:border-amber-500 focus:ring-4 focus:ring-amber-200"
                      min="0.1"
                      max="1.0"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="mb-3 block flex items-center gap-1 text-sm font-bold text-amber-800">
                      <span>🧱</span>
                      Material
                    </label>
                    <select
                      value={bedPlacement.newBedSettings.material}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (isValidMaterial(value)) {
                          bedPlacement.setNewBedSettings((prev) => ({ ...prev, material: value }));
                        }
                      }}
                      className="w-full rounded-xl border-2 border-amber-300 px-4 py-3 transition-all focus:border-amber-500 focus:ring-4 focus:ring-amber-200"
                    >
                      <option value="wood">Wood</option>
                      <option value="stone">Stone</option>
                      <option value="metal">Metal</option>
                      <option value="composite">Composite</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-3 block flex items-center gap-2 text-sm font-bold text-amber-800">
                    <span>🌱</span>
                    Soil Type
                  </label>
                  <input
                    type="text"
                    value={bedPlacement.newBedSettings.soilType}
                    onChange={(e) =>
                      bedPlacement.setNewBedSettings((prev) => ({
                        ...prev,
                        soilType: e.target.value,
                      }))
                    }
                    onBlur={bedPlacement.validateCurrentSettings}
                    className="w-full rounded-xl border-2 border-amber-300 px-4 py-3 transition-all focus:border-amber-500 focus:ring-4 focus:ring-amber-200"
                    placeholder="e.g. organic compost, garden soil mix"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Plant Selection */}
          {interaction.isPlacing && (
            <div className="mb-8">
              <div className="rounded-xl border-2 border-green-200 bg-green-50 p-6 shadow-lg">
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-3xl">🌱</span>
                  <h4 className="text-lg font-bold text-green-800">Plant Selection</h4>
                </div>
                <label className="mb-3 block text-sm font-bold text-green-800">
                  Choose Plant Type
                </label>
                <select
                  value={interaction.selectedPlantType || ''}
                  onChange={(e) => interaction.setSelectedPlantType(e.target.value)}
                  className="w-full rounded-xl border-2 border-green-300 px-4 py-3 text-lg transition-all focus:border-green-500 focus:ring-4 focus:ring-green-200"
                >
                  <option value="">Choose a plant...</option>
                  {plantTypes?.map((plantType) => (
                    <option key={plantType._id} value={plantType.name}>
                      {plantType.name} ({plantType.category})
                    </option>
                  ))}
                </select>
                <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <p className="flex items-center gap-2 text-sm text-blue-700">
                    <span>💡</span>
                    Plants can be placed in raised beds or directly in garden soil
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Selected Plant Info */}
          {interaction.selectedPlant && (
            <div className="mb-8 rounded-xl border-2 border-blue-300 bg-blue-50 p-6 shadow-lg">
              <div className="mb-4 flex items-center gap-3">
                <span className="text-3xl">🌿</span>
                <h4 className="text-lg font-bold text-blue-800">Selected Plant</h4>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between border-b border-blue-200 py-2">
                  <span className="font-semibold text-blue-700">Name:</span>
                  <span className="font-bold text-blue-900">{interaction.selectedPlant.name}</span>
                </div>
                <div className="flex items-center justify-between border-b border-blue-200 py-2">
                  <span className="font-semibold text-blue-700">Position:</span>
                  <span className="text-blue-900">
                    ({interaction.selectedPlant.x.toFixed(1)},{' '}
                    {interaction.selectedPlant.y.toFixed(1)})
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-blue-200 py-2">
                  <span className="font-semibold text-blue-700">Size:</span>
                  <span className="text-blue-900">
                    {interaction.selectedPlant.width.toFixed(1)}m ×{' '}
                    {interaction.selectedPlant.height.toFixed(1)}m
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-blue-200 py-2">
                  <span className="font-semibold text-blue-700">Status:</span>
                  <span className="text-blue-900 capitalize">
                    {interaction.selectedPlant.status}
                  </span>
                </div>
                {interaction.selectedPlant.raisedBedId && (
                  <div className="flex items-center justify-between py-2">
                    <span className="font-semibold text-blue-700">Location:</span>
                    <span className="flex items-center gap-1 text-blue-900">
                      <span>🪴</span>
                      In Raised Bed
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Selected Bed Info */}
          {interaction.selectedBed && (
            <div className="mb-8 rounded-xl border-2 border-orange-300 bg-orange-50 p-6 shadow-lg">
              <div className="mb-4 flex items-center gap-3">
                <span className="text-3xl">🪴</span>
                <h4 className="text-lg font-bold text-orange-800">Selected Raised Bed</h4>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between border-b border-orange-200 py-2">
                  <span className="font-semibold text-orange-700">Name:</span>
                  <span className="font-bold text-orange-900">{interaction.selectedBed.name}</span>
                </div>
                <div className="flex items-center justify-between border-b border-orange-200 py-2">
                  <span className="font-semibold text-orange-700">Position:</span>
                  <span className="text-orange-900">
                    ({interaction.selectedBed.x.toFixed(1)}, {interaction.selectedBed.y.toFixed(1)})
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-orange-200 py-2">
                  <span className="font-semibold text-orange-700">Size:</span>
                  <span className="text-orange-900">
                    {interaction.selectedBed.width.toFixed(1)}m ×{' '}
                    {interaction.selectedBed.height.toFixed(1)}m
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-orange-200 py-2">
                  <span className="font-semibold text-orange-700">Height:</span>
                  <span className="text-orange-900">
                    {interaction.selectedBed.bedHeight.toFixed(1)}m
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-orange-200 py-2">
                  <span className="font-semibold text-orange-700">Material:</span>
                  <span className="text-orange-900 capitalize">
                    {interaction.selectedBed.material}
                  </span>
                </div>
                {interaction.selectedBed.soilType && (
                  <div className="flex items-center justify-between py-2">
                    <span className="font-semibold text-orange-700">Soil:</span>
                    <span className="text-orange-900">{interaction.selectedBed.soilType}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Raised Beds List */}
          {raisedBeds && raisedBeds.length > 0 && (
            <div className="mb-8">
              <div className="mb-4 flex items-center gap-3">
                <span className="text-2xl">🪴</span>
                <h4 className="text-lg font-bold text-gray-900">Raised Beds</h4>
                <div className="bg-gradient-earth rounded-full border border-amber-200 px-3 py-1">
                  <span className="text-sm font-bold text-amber-800">{raisedBeds.length}</span>
                </div>
              </div>
              <div className="max-h-40 space-y-3 overflow-y-auto pr-2">
                {raisedBeds.map((bed) => (
                  <div
                    key={bed._id}
                    className={`hover-lift cursor-pointer rounded-xl border-2 border-gray-200 bg-white p-4 transition-all hover:border-orange-300 hover:shadow-md ${
                      interaction.selectedBed?._id === bed._id
                        ? 'border-orange-400 bg-orange-50 shadow-lg'
                        : ''
                    }`}
                    onClick={() => interaction.selectBed(bed)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-5 w-5 rounded-lg border border-gray-300 shadow-sm"
                          style={{ backgroundColor: bed.color }}
                        />
                        <span className="text-sm font-bold text-gray-900">{bed.name}</span>
                      </div>
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500">
                        {bed.material}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Plants */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="text-2xl">🌱</span>
              <h4 className="text-lg font-bold text-gray-900">Available Plants</h4>
              <div className="bg-gradient-leaf rounded-full border border-green-200 px-3 py-1">
                <span className="text-sm font-bold text-green-800">{plantTypes?.length || 0}</span>
              </div>
            </div>
            <div className="max-h-60 space-y-3 overflow-y-auto pr-2">
              {plantTypes?.map((plantType) => (
                <div
                  key={plantType._id}
                  className="hover-lift group cursor-pointer rounded-xl border-2 border-gray-200 bg-white p-4 transition-all hover:border-green-300 hover:shadow-md"
                  onClick={() => {
                    interaction.setSelectedPlantType(plantType.name);
                    if (!interaction.isPlacing) {
                      interaction.startPlantPlacement();
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-5 w-5 rounded-lg border border-gray-300 shadow-sm"
                        style={{ backgroundColor: plantType.color }}
                      />
                      <span className="text-sm font-bold text-gray-900 transition-colors group-hover:text-green-700">
                        {plantType.name}
                      </span>
                    </div>
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500">
                      {plantType.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!interaction.showPlantPanel && (
        <GardenButton
          variant="primary"
          onClick={() => interaction.setShowPlantPanel(true)}
          className="gentle-pulse fixed top-24 right-6 h-16 w-16 rounded-2xl p-0 text-2xl shadow-2xl"
        >
          🧑‍🌾
        </GardenButton>
      )}
    </div>
  );
}
