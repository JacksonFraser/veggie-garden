"use client";

import { 
  useGarden, 
  usePlantsByGarden, 
  useRaisedBedsByGarden, 
  usePlantTypes,
  useDeletePlant,
  useDeleteRaisedBed
} from "@/lib/convex-hooks";
import { useRef } from "react";
import {
  useGardenInteraction,
  usePlantPlacement,
  useRaisedBedPlacement,
  usePlantDragging,
  useCanvasDrawing
} from "@/hooks";

import { GardenId, CANVAS_SCALE } from "@/types";
import { isValidMaterial } from "@/lib/validation";

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
    scale: CANVAS_SCALE
  });
  const plantDragging = usePlantDragging({ 
    garden, 
    plants, 
    selectedPlant: interaction.selectedPlant, 
    setSelectedPlant: interaction.selectPlant,
    scale: CANVAS_SCALE 
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
      const clickedBed = raisedBeds?.find(bed => {
        return x >= bed.x && x <= bed.x + bed.width &&
               y >= bed.y && y <= bed.y + bed.height;
      });
      
      const clickedPlant = plants?.find(plant => {
        return x >= plant.x && x <= plant.x + plant.width &&
               y >= plant.y && y <= plant.y + plant.height;
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

  if (!garden) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <span className="text-6xl animate-gentle-pulse block mb-4">🌱</span>
        <p className="text-xl text-gray-600">Loading your garden...</p>
      </div>
    </div>
  );

  return (
    <div className="flex gap-10">
      <div className="flex-1">
        <div className="card-garden-panel p-8">
          <div className="mb-8">
            <div className="flex justify-between items-center">
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
                  <div className="text-lg font-bold text-green-900">{garden.width}m × {garden.height}m</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="garden-canvas overflow-auto mb-8 garden-grid">
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
          
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => {
                if (interaction.isPlacing) {
                  interaction.stopPlacement();
                } else {
                  interaction.startPlantPlacement();
                }
              }}
              className={interaction.isPlacing ? "btn-garden-danger" : "btn-garden-primary"}
            >
              <span className="text-lg">{interaction.isPlacing ? "❌" : "🌱"}</span>
              {interaction.isPlacing ? "Stop Placing" : "Place Plants"}
            </button>
            
            <button
              onClick={() => {
                if (interaction.isPlacingBed) {
                  interaction.stopPlacement();
                } else {
                  interaction.startBedPlacement();
                }
              }}
              className={interaction.isPlacingBed ? "btn-garden-danger" : "btn-garden-amber"}
            >
              <span className="text-lg">{interaction.isPlacingBed ? "❌" : "🪴"}</span>
              {interaction.isPlacingBed ? "Stop Placing" : "Add Raised Bed"}
            </button>
            
            {interaction.selectedPlant && (
              <button
                onClick={() => {
                  if (interaction.selectedPlant?._id) {
                    deletePlant.mutate({ id: interaction.selectedPlant._id });
                    interaction.clearSelection();
                  }
                }}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 font-bold shadow-lg hover-lift transition-all border-2 border-red-500 flex items-center gap-2"
              >
                <span className="text-lg">🗑️</span>
                Delete Plant
              </button>
            )}
            
            {interaction.selectedBed && (
              <button
                onClick={() => {
                  if (interaction.selectedBed?._id) {
                    deleteRaisedBed.mutate({ id: interaction.selectedBed._id });
                    interaction.clearSelection();
                  }
                }}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 font-bold shadow-lg hover-lift transition-all border-2 border-red-500 flex items-center gap-2"
              >
                <span className="text-lg">🗑️</span>
                Delete Bed
              </button>
            )}
          </div>
        </div>
      </div>

      {interaction.showPlantPanel && (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border-2 border-green-200" style={{width: '380px'}}>
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🧑‍🌾</span>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Garden Tools</h3>
                <p className="text-sm text-gray-600">Design your perfect garden</p>
              </div>
            </div>
            <button
              onClick={() => interaction.setShowPlantPanel(false)}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 border-2 border-gray-300 rounded-xl text-gray-600 hover:text-gray-900 font-bold transition-all hover-lift"
            >
              ✕
            </button>
          </div>
          
          {/* Raised Bed Settings */}
          {interaction.isPlacingBed && (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 mb-8 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🪴</span>
                <h4 className="font-bold text-amber-800 text-lg">New Raised Bed</h4>
              </div>
              {bedPlacement.validationErrors.length > 0 && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg text-sm text-red-700 mb-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
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
                  <label className="block text-sm font-bold text-amber-800 mb-3 flex items-center gap-2">
                    <span>🏷️</span>
                    Bed Name
                  </label>
                  <input
                    type="text"
                    value={bedPlacement.newBedSettings.name}
                    onChange={(e) => bedPlacement.setNewBedSettings(prev => ({ ...prev, name: e.target.value }))}
                    onBlur={bedPlacement.validateCurrentSettings}
                    className="w-full px-4 py-3 border-2 border-amber-300 rounded-xl focus:ring-4 focus:ring-amber-200 focus:border-amber-500 transition-all"
                    placeholder="e.g. Herb Garden Bed"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-amber-800 mb-3 flex items-center gap-1">
                      <span>↔️</span>
                      Width (m)
                    </label>
                    <input
                      type="number"
                      value={bedPlacement.newBedSettings.width}
                      onChange={(e) => bedPlacement.setNewBedSettings(prev => ({ ...prev, width: Number(e.target.value) }))}
                      onBlur={bedPlacement.validateCurrentSettings}
                      className="w-full px-4 py-3 border-2 border-amber-300 rounded-xl focus:ring-4 focus:ring-amber-200 focus:border-amber-500 transition-all"
                      min="0.3"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-amber-800 mb-3 flex items-center gap-1">
                      <span>↕️</span>
                      Length (m)
                    </label>
                    <input
                      type="number"
                      value={bedPlacement.newBedSettings.height}
                      onChange={(e) => bedPlacement.setNewBedSettings(prev => ({ ...prev, height: Number(e.target.value) }))}
                      onBlur={bedPlacement.validateCurrentSettings}
                      className="w-full px-4 py-3 border-2 border-amber-300 rounded-xl focus:ring-4 focus:ring-amber-200 focus:border-amber-500 transition-all"
                      min="0.3"
                      step="0.1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-amber-800 mb-3 flex items-center gap-1">
                      <span>⬆️</span>
                      Height (m)
                    </label>
                    <input
                      type="number"
                      value={bedPlacement.newBedSettings.bedHeight}
                      onChange={(e) => bedPlacement.setNewBedSettings(prev => ({ ...prev, bedHeight: Number(e.target.value) }))}
                      onBlur={bedPlacement.validateCurrentSettings}
                      className="w-full px-4 py-3 border-2 border-amber-300 rounded-xl focus:ring-4 focus:ring-amber-200 focus:border-amber-500 transition-all"
                      min="0.1"
                      max="1.0"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-amber-800 mb-3 flex items-center gap-1">
                      <span>🧱</span>
                      Material
                    </label>
                    <select
                      value={bedPlacement.newBedSettings.material}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (isValidMaterial(value)) {
                          bedPlacement.setNewBedSettings(prev => ({ ...prev, material: value }));
                        }
                      }}
                      className="w-full px-4 py-3 border-2 border-amber-300 rounded-xl focus:ring-4 focus:ring-amber-200 focus:border-amber-500 transition-all"
                    >
                      <option value="wood">Wood</option>
                      <option value="stone">Stone</option>
                      <option value="metal">Metal</option>
                      <option value="composite">Composite</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-amber-800 mb-3 flex items-center gap-2">
                    <span>🌱</span>
                    Soil Type
                  </label>
                  <input
                    type="text"
                    value={bedPlacement.newBedSettings.soilType}
                    onChange={(e) => bedPlacement.setNewBedSettings(prev => ({ ...prev, soilType: e.target.value }))}
                    onBlur={bedPlacement.validateCurrentSettings}
                    className="w-full px-4 py-3 border-2 border-amber-300 rounded-xl focus:ring-4 focus:ring-amber-200 focus:border-amber-500 transition-all"
                    placeholder="e.g. organic compost, garden soil mix"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Plant Selection */}
          {interaction.isPlacing && (
            <div className="mb-8">
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">🌱</span>
                  <h4 className="font-bold text-green-800 text-lg">Plant Selection</h4>
                </div>
                <label className="block text-sm font-bold text-green-800 mb-3">
                  Choose Plant Type
                </label>
                <select
                  value={interaction.selectedPlantType || ""}
                  onChange={(e) => interaction.setSelectedPlantType(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all text-lg"
                >
                  <option value="">Choose a plant...</option>
                  {plantTypes?.map(plantType => (
                    <option key={plantType._id} value={plantType.name}>
                      {plantType.name} ({plantType.category})
                    </option>
                  ))}
                </select>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700 flex items-center gap-2">
                    <span>💡</span>
                    Plants can be placed in raised beds or directly in garden soil
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Selected Plant Info */}
          {interaction.selectedPlant && (
            <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 mb-8 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🌿</span>
                <h4 className="font-bold text-blue-800 text-lg">Selected Plant</h4>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-blue-200">
                  <span className="font-semibold text-blue-700">Name:</span>
                  <span className="text-blue-900 font-bold">{interaction.selectedPlant.name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-200">
                  <span className="font-semibold text-blue-700">Position:</span>
                  <span className="text-blue-900">({interaction.selectedPlant.x.toFixed(1)}, {interaction.selectedPlant.y.toFixed(1)})</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-200">
                  <span className="font-semibold text-blue-700">Size:</span>
                  <span className="text-blue-900">{interaction.selectedPlant.width.toFixed(1)}m × {interaction.selectedPlant.height.toFixed(1)}m</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-200">
                  <span className="font-semibold text-blue-700">Status:</span>
                  <span className="text-blue-900 capitalize">{interaction.selectedPlant.status}</span>
                </div>
                {interaction.selectedPlant.raisedBedId && (
                  <div className="flex justify-between items-center py-2">
                    <span className="font-semibold text-blue-700">Location:</span>
                    <span className="text-blue-900 flex items-center gap-1">
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
            <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-6 mb-8 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🪴</span>
                <h4 className="font-bold text-orange-800 text-lg">Selected Raised Bed</h4>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-orange-200">
                  <span className="font-semibold text-orange-700">Name:</span>
                  <span className="text-orange-900 font-bold">{interaction.selectedBed.name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-orange-200">
                  <span className="font-semibold text-orange-700">Position:</span>
                  <span className="text-orange-900">({interaction.selectedBed.x.toFixed(1)}, {interaction.selectedBed.y.toFixed(1)})</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-orange-200">
                  <span className="font-semibold text-orange-700">Size:</span>
                  <span className="text-orange-900">{interaction.selectedBed.width.toFixed(1)}m × {interaction.selectedBed.height.toFixed(1)}m</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-orange-200">
                  <span className="font-semibold text-orange-700">Height:</span>
                  <span className="text-orange-900">{interaction.selectedBed.bedHeight.toFixed(1)}m</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-orange-200">
                  <span className="font-semibold text-orange-700">Material:</span>
                  <span className="text-orange-900 capitalize">{interaction.selectedBed.material}</span>
                </div>
                {interaction.selectedBed.soilType && (
                  <div className="flex justify-between items-center py-2">
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
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🪴</span>
                <h4 className="font-bold text-gray-900 text-lg">Raised Beds</h4>
                <div className="bg-gradient-earth px-3 py-1 rounded-full border border-amber-200">
                  <span className="text-sm font-bold text-amber-800">{raisedBeds.length}</span>
                </div>
              </div>
              <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                {raisedBeds.map(bed => (
                  <div
                    key={bed._id}
                    className={`p-4 bg-white border-2 border-gray-200 rounded-xl cursor-pointer hover:border-orange-300 hover:shadow-md transition-all hover-lift ${
                      interaction.selectedBed?._id === bed._id ? 'border-orange-400 bg-orange-50 shadow-lg' : ''
                    }`}
                    onClick={() => interaction.selectBed(bed)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-5 h-5 rounded-lg shadow-sm border border-gray-300"
                          style={{ backgroundColor: bed.color }}
                        />
                        <span className="text-sm font-bold text-gray-900">{bed.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{bed.material}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Available Plants */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🌱</span>
              <h4 className="font-bold text-gray-900 text-lg">Available Plants</h4>
              <div className="bg-gradient-leaf px-3 py-1 rounded-full border border-green-200">
                <span className="text-sm font-bold text-green-800">{plantTypes?.length || 0}</span>
              </div>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {plantTypes?.map(plantType => (
                <div
                  key={plantType._id}
                  className="p-4 bg-white border-2 border-gray-200 rounded-xl cursor-pointer hover:border-green-300 hover:shadow-md transition-all hover-lift group"
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
                        className="w-5 h-5 rounded-lg shadow-sm border border-gray-300"
                        style={{ backgroundColor: plantType.color }}
                      />
                      <span className="text-sm font-bold text-gray-900 group-hover:text-green-700 transition-colors">{plantType.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{plantType.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!interaction.showPlantPanel && (
        <button
          onClick={() => interaction.setShowPlantPanel(true)}
          className="fixed right-6 top-24 w-16 h-16 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl shadow-2xl hover:from-green-700 hover:to-green-800 transition-all hover-lift border-2 border-green-600 flex items-center justify-center text-2xl gentle-pulse"
        >
          🧑‍🌾
        </button>
      )}
    </div>
  );
}