"use client";

import { useState } from "react";
import { GardenDesigner } from "@/components/GardenDesigner";
import { Garden3D } from "@/components/Garden3D";
import { useGardens, useCreateGarden, useSeedPlantTypes, useDeleteGarden } from "@/lib/convex-hooks";
import { GardenId } from "@/types";
import { safeValidateGardenCreation, formatZodError } from "@/lib/validation";

export default function Home() {
  const { data: gardens } = useGardens();
  const createGarden = useCreateGarden();
  const seedPlantTypes = useSeedPlantTypes();
  const deleteGarden = useDeleteGarden();
  const [selectedGarden, setSelectedGarden] = useState<GardenId | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGardenName, setNewGardenName] = useState("");
  const [gardenDimensions, setGardenDimensions] = useState({ width: 3, height: 2.5 });
  const [view3D, setView3D] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [selectedGardens, setSelectedGardens] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);

  const handleCreateGarden = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);

    const gardenData = {
      name: newGardenName,
      width: gardenDimensions.width,
      height: gardenDimensions.height,
      description: `A ${gardenDimensions.width}x${gardenDimensions.height} meter garden`,
    };

    // Validate with Zod
    const validation = safeValidateGardenCreation(gardenData);
    if (!validation.success) {
      setFormErrors(formatZodError(validation.error));
      return;
    }

    createGarden.mutate(validation.data, {
      onSuccess: () => {
        setNewGardenName("");
        setGardenDimensions({ width: 3, height: 2.5 });
        setShowCreateForm(false);
        setFormErrors([]);
        seedPlantTypes.mutate({});
      },
      onError: (error) => {
        setFormErrors([`Failed to create garden: ${error.message}`]);
      }
    });
  };

  const handleDeleteGarden = async (gardenId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent card click
    }
    
    if (window.confirm('Are you sure you want to delete this garden? This action cannot be undone.')) {
      try {
        await deleteGarden.mutateAsync({ id: gardenId as GardenId });
      } catch (error) {
        console.error('Failed to delete garden:', error);
        alert('Failed to delete garden. Please try again.');
      }
    }
  };

  const handleToggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedGardens(new Set());
  };

  const handleSelectGarden = (gardenId: string, e: React.MouseEvent | React.ChangeEvent) => {
    e.stopPropagation();
    const newSelected = new Set(selectedGardens);
    if (newSelected.has(gardenId)) {
      newSelected.delete(gardenId);
    } else {
      newSelected.add(gardenId);
    }
    setSelectedGardens(newSelected);
  };

  const handleSelectAll = () => {
    if (!gardens) return;
    const allIds = new Set(gardens.map(g => g._id));
    setSelectedGardens(selectedGardens.size === gardens.length ? new Set() : allIds);
  };

  const handleBulkDelete = async () => {
    if (selectedGardens.size === 0) return;
    
    const confirmMessage = `Are you sure you want to delete ${selectedGardens.size} garden${selectedGardens.size === 1 ? '' : 's'}? This action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        const deletePromises = Array.from(selectedGardens).map(id => 
          deleteGarden.mutateAsync({ id: id as GardenId })
        );
        await Promise.all(deletePromises);
        setSelectedGardens(new Set());
        setIsSelectMode(false);
      } catch (error) {
        console.error('Failed to delete gardens:', error);
        alert('Failed to delete some gardens. Please try again.');
      }
    }
  };

  if (selectedGarden) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between py-8">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setSelectedGarden(null)}
                className="btn-garden-secondary"
              >
                ← Back to Gardens
              </button>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <span className="text-5xl animate-float">🌱</span>
                Garden Designer
              </h1>
            </div>
            <button
              onClick={() => setView3D(!view3D)}
              className={`px-6 py-3 rounded-xl font-semibold shadow-lg hover-lift transition-all ${
                view3D
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white border-2 border-green-600'
                  : 'bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              {view3D ? "📐 2D View" : "🌍 3D View"}
            </button>
          </div>
          {view3D ? (
            <Garden3D gardenId={selectedGarden} />
          ) : (
            <GardenDesigner gardenId={selectedGarden} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-20">
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="text-8xl animate-float">🌱</span>
            <h1 className="text-6xl font-bold text-gradient-garden">
              Veggie Garden Designer
            </h1>
            <span className="text-8xl animate-float" style={{animationDelay: '1s'}}>🍅</span>
          </div>
          <p className="text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Design and plan your perfect vegetable garden with our intuitive tools
          </p>
          <div className="flex items-center justify-center gap-8 mt-8 text-lg text-gray-500">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌿</span>
              <span>Drag & Drop</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🪴</span>
              <span>Raised Beds</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌍</span>
              <span>3D Preview</span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-4">
              <h2 className="text-4xl font-bold text-gray-900">Your Gardens</h2>
              <div className="bg-gradient-leaf px-4 py-2 rounded-full border border-green-200">
                <span className="text-sm font-semibold text-green-800">
                  {gardens?.length || 0} garden{gardens?.length === 1 ? '' : 's'}
                </span>
              </div>
            </div>
            <div className="flex gap-4">
              {gardens && gardens.length > 0 && (
                <button
                  onClick={handleToggleSelectMode}
                  className={`px-6 py-3 rounded-xl font-semibold shadow-lg hover-lift transition-all ${
                    isSelectMode
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white border-2 border-red-500'
                      : 'bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {isSelectMode ? 'Cancel Selection' : '✓ Select Gardens'}
                </button>
              )}
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 font-semibold shadow-lg hover-lift transition-all border-2 border-green-600 flex items-center gap-2"
              >
                <span className="text-lg">➕</span>
                New Garden
              </button>
            </div>
          </div>

          {isSelectMode && gardens && gardens.length > 0 && (
            <div className="flex justify-between items-center mb-8 p-6 bg-white/80 backdrop-blur-sm border-2 border-blue-200 rounded-2xl shadow-lg">
              <div className="flex items-center gap-6">
                <button
                  onClick={handleSelectAll}
                  className="px-4 py-2 bg-gradient-sky border-2 border-blue-200 rounded-lg hover:border-blue-300 text-blue-800 font-semibold transition-all"
                >
                  {selectedGardens.size === gardens.length ? '✕ Deselect All' : '✓ Select All'}
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📋</span>
                  <span className="text-lg font-semibold text-blue-800">
                    {selectedGardens.size} of {gardens.length} selected
                  </span>
                </div>
              </div>
              {selectedGardens.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 font-semibold shadow-lg hover-lift transition-all border-2 border-red-500 flex items-center gap-2"
                >
                  <span className="text-lg">🗑️</span>
                  Delete Selected ({selectedGardens.size})
                </button>
              )}
            </div>
          )}

          {showCreateForm && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-10 mb-12 border-2 border-green-200 hover:border-green-300 transition-all">
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl gentle-pulse">🌱</span>
                  <h3 className="text-3xl font-bold text-gray-900">Create New Garden</h3>
                </div>
                <p className="text-gray-600 text-lg">Design your perfect growing space</p>
              </div>
              <form onSubmit={handleCreateGarden} className="space-y-8">
                {formErrors.length > 0 && (
                  <div className="p-6 bg-red-50 border-2 border-red-200 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">⚠️</span>
                      <strong className="text-lg text-red-800">Please fix the following errors:</strong>
                    </div>
                    <ul className="space-y-1 ml-6 list-disc text-red-700">
                      {formErrors.map((error, index) => (
                        <li key={index} className="text-sm">{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  <label className="block text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="text-xl">🏷️</span>
                    Garden Name
                  </label>
                  <input
                    type="text"
                    value={newGardenName}
                    onChange={(e) => setNewGardenName(e.target.value)}
                    className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 text-lg transition-all"
                    placeholder="e.g. Backyard Vegetable Garden"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="text-xl">↔️</span>
                      Width (meters)
                    </label>
                    <input
                      type="number"
                      value={gardenDimensions.width}
                      onChange={(e) => setGardenDimensions(prev => ({ ...prev, width: Number(e.target.value) }))}
                      className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 text-lg transition-all"
                      min="0.5"
                      step="0.1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="text-xl">↕️</span>
                      Height (meters)
                    </label>
                    <input
                      type="number"
                      value={gardenDimensions.height}
                      onChange={(e) => setGardenDimensions(prev => ({ ...prev, height: Number(e.target.value) }))}
                      className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 text-lg transition-all"
                      min="0.5"
                      step="0.1"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-6 pt-4">
                  <button
                    type="submit"
                    className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 font-bold text-lg shadow-lg hover-lift transition-all border-2 border-green-600 flex items-center gap-3"
                  >
                    <span className="text-xl">✨</span>
                    Create Garden
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setFormErrors([]);
                    }}
                    className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-bold text-lg shadow-lg hover-lift transition-all border-2 border-gray-300 flex items-center gap-3"
                  >
                    <span className="text-xl">❌</span>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {gardens?.map((garden) => (
              <div
                key={garden._id}
                className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 cursor-pointer transition-all duration-300 hover-lift border-2 border-gray-200 hover:border-green-300 relative group ${
                  isSelectMode && selectedGardens.has(garden._id) ? 'ring-4 ring-green-400 border-green-400' : ''
                }`}
                onClick={(e) => {
                  if (isSelectMode) {
                    handleSelectGarden(garden._id, e);
                  } else {
                    setSelectedGarden(garden._id);
                  }
                }}
              >
                {isSelectMode && (
                  <div className="absolute top-4 left-4 z-10">
                    <div className="w-6 h-6 bg-white rounded-full shadow-lg border-2 border-gray-300 flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={selectedGardens.has(garden._id)}
                        onChange={(e) => handleSelectGarden(garden._id, e)}
                        className="w-4 h-4 text-green-600 border-none rounded focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                )}
                {!isSelectMode && (
                  <button
                    onClick={(e) => handleDeleteGarden(garden._id, e)}
                    className="absolute top-4 right-4 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center text-lg font-bold border-2 border-red-500 cursor-pointer transition-all duration-200 z-10 shadow-lg hover:bg-red-600 hover:scale-110 opacity-0 group-hover:opacity-100"
                    title="Delete garden"
                  >
                    🗑️
                  </button>
                )}
                <div className="text-center mb-4">
                  <span className="text-5xl gentle-pulse">🌿</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">{garden.name}</h3>
                <p className="text-gray-600 mb-6 text-center leading-relaxed">{garden.description}</p>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl mb-1">📏</div>
                    <div className="text-sm font-semibold text-gray-700">Size</div>
                    <div className="text-lg font-bold text-green-600">{garden.width}m × {garden.height}m</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">📅</div>
                    <div className="text-sm font-semibold text-gray-700">Created</div>
                    <div className="text-sm text-gray-600">{new Date(garden.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            )) || (
              <div className="col-span-full text-center py-24">
                <div className="mb-8">
                  <span className="text-8xl gentle-pulse">🌱</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-700 mb-4">No gardens yet</h3>
                <p className="text-xl text-gray-500 mb-8 max-w-md mx-auto">
                  Create your first garden to start planning your perfect vegetable growing space!
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 font-bold text-lg shadow-lg hover-lift transition-all border-2 border-green-600 flex items-center gap-3 mx-auto"
                >
                  <span className="text-xl">✨</span>
                  Create Your First Garden
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}