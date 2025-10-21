'use client';

import { useState } from 'react';
import { GardenDesigner } from '@/components/GardenDesigner';
import { Garden3D } from '@/components/Garden3D';
import { GardenButton, GardenCard } from '@/components/ui';
import {
  useGardens,
  useCreateGarden,
  useSeedPlantTypes,
  useDeleteGarden,
} from '@/lib/convex-hooks';
import { GardenId } from '@/types';
import { safeValidateGardenCreation, formatZodError } from '@/lib/validation';

export default function Home() {
  const { data: gardens } = useGardens();
  const createGarden = useCreateGarden();
  const seedPlantTypes = useSeedPlantTypes();
  const deleteGarden = useDeleteGarden();
  const [selectedGarden, setSelectedGarden] = useState<GardenId | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGardenName, setNewGardenName] = useState('');
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
        setNewGardenName('');
        setGardenDimensions({ width: 3, height: 2.5 });
        setShowCreateForm(false);
        setFormErrors([]);
        seedPlantTypes.mutate({});
      },
      onError: (error) => {
        setFormErrors([`Failed to create garden: ${error.message}`]);
      },
    });
  };

  const handleDeleteGarden = async (gardenId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent card click
    }

    if (
      window.confirm('Are you sure you want to delete this garden? This action cannot be undone.')
    ) {
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
    const allIds = new Set(gardens.map((g) => g._id));
    setSelectedGardens(selectedGardens.size === gardens.length ? new Set() : allIds);
  };

  const handleBulkDelete = async () => {
    if (selectedGardens.size === 0) return;

    const confirmMessage = `Are you sure you want to delete ${selectedGardens.size} garden${selectedGardens.size === 1 ? '' : 's'}? This action cannot be undone.`;

    if (window.confirm(confirmMessage)) {
      try {
        const deletePromises = Array.from(selectedGardens).map((id) =>
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
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between py-8">
            <div className="flex items-center gap-6">
              <GardenButton variant="secondary" onClick={() => setSelectedGarden(null)}>
                ← Back to Gardens
              </GardenButton>
              <h1 className="flex items-center gap-3 text-4xl font-bold text-gray-900">
                <span className="animate-float text-5xl">🌱</span>
                Garden Designer
              </h1>
            </div>
            <GardenButton
              variant={view3D ? 'primary' : 'outline'}
              onClick={() => setView3D(!view3D)}
            >
              {view3D ? '📐 2D View' : '🌍 3D View'}
            </GardenButton>
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
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-20 text-center">
          <div className="mb-6 flex items-center justify-center gap-4">
            <span className="animate-float text-8xl">🌱</span>
            <h1 className="text-gradient-garden text-6xl font-bold">Veggie Garden Designer</h1>
            <span className="animate-float text-8xl" style={{ animationDelay: '1s' }}>
              🍅
            </span>
          </div>
          <p className="mx-auto max-w-2xl text-2xl leading-relaxed text-gray-600">
            Design and plan your perfect vegetable garden with our intuitive tools
          </p>
          <div className="mt-8 flex items-center justify-center gap-8 text-lg text-gray-500">
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

        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-4xl font-bold text-gray-900">Your Gardens</h2>
              <div className="bg-gradient-leaf rounded-full border border-green-200 px-4 py-2">
                <span className="text-sm font-semibold text-green-800">
                  {gardens?.length || 0} garden{gardens?.length === 1 ? '' : 's'}
                </span>
              </div>
            </div>
            <div className="flex gap-4">
              {gardens && gardens.length > 0 && (
                <GardenButton
                  variant={isSelectMode ? 'danger' : 'outline'}
                  onClick={handleToggleSelectMode}
                >
                  {isSelectMode ? 'Cancel Selection' : '✓ Select Gardens'}
                </GardenButton>
              )}
              <GardenButton
                variant="primary"
                size="lg"
                icon={<span className="text-lg">➕</span>}
                onClick={() => setShowCreateForm(true)}
              >
                New Garden
              </GardenButton>
            </div>
          </div>

          {isSelectMode && gardens && gardens.length > 0 && (
            <div className="mb-8 flex items-center justify-between rounded-2xl border-2 border-blue-200 bg-white/80 p-6 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-6">
                <button
                  onClick={handleSelectAll}
                  className="bg-gradient-sky rounded-lg border-2 border-blue-200 px-4 py-2 font-semibold text-blue-800 transition-all hover:border-blue-300"
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
                <GardenButton
                  variant="danger"
                  icon={<span className="text-lg">🗑️</span>}
                  onClick={handleBulkDelete}
                >
                  Delete Selected ({selectedGardens.size})
                </GardenButton>
              )}
            </div>
          )}

          {showCreateForm && (
            <div className="mb-12 rounded-2xl border-2 border-green-200 bg-white/90 p-10 shadow-2xl backdrop-blur-sm transition-all hover:border-green-300">
              <div className="mb-8">
                <div className="mb-4 flex items-center gap-4">
                  <span className="gentle-pulse text-4xl">🌱</span>
                  <h3 className="text-3xl font-bold text-gray-900">Create New Garden</h3>
                </div>
                <p className="text-lg text-gray-600">Design your perfect growing space</p>
              </div>
              <form onSubmit={handleCreateGarden} className="space-y-8">
                {formErrors.length > 0 && (
                  <div className="rounded-xl border-2 border-red-200 bg-red-50 p-6 shadow-sm">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="text-2xl">⚠️</span>
                      <strong className="text-lg text-red-800">
                        Please fix the following errors:
                      </strong>
                    </div>
                    <ul className="ml-6 list-disc space-y-1 text-red-700">
                      {formErrors.map((error, index) => (
                        <li key={index} className="text-sm">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  <label className="mb-3 block flex items-center gap-2 text-lg font-bold text-gray-800">
                    <span className="text-xl">🏷️</span>
                    Garden Name
                  </label>
                  <input
                    type="text"
                    value={newGardenName}
                    onChange={(e) => setNewGardenName(e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-300 px-6 py-4 text-lg transition-all focus:border-green-500 focus:ring-4 focus:ring-green-200"
                    placeholder="e.g. Backyard Vegetable Garden"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="mb-3 block flex items-center gap-2 text-lg font-bold text-gray-800">
                      <span className="text-xl">↔️</span>
                      Width (meters)
                    </label>
                    <input
                      type="number"
                      value={gardenDimensions.width}
                      onChange={(e) =>
                        setGardenDimensions((prev) => ({ ...prev, width: Number(e.target.value) }))
                      }
                      className="w-full rounded-xl border-2 border-gray-300 px-6 py-4 text-lg transition-all focus:border-green-500 focus:ring-4 focus:ring-green-200"
                      min="0.5"
                      step="0.1"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-3 block flex items-center gap-2 text-lg font-bold text-gray-800">
                      <span className="text-xl">↕️</span>
                      Height (meters)
                    </label>
                    <input
                      type="number"
                      value={gardenDimensions.height}
                      onChange={(e) =>
                        setGardenDimensions((prev) => ({ ...prev, height: Number(e.target.value) }))
                      }
                      className="w-full rounded-xl border-2 border-gray-300 px-6 py-4 text-lg transition-all focus:border-green-500 focus:ring-4 focus:ring-green-200"
                      min="0.5"
                      step="0.1"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-6 pt-4">
                  <GardenButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    icon={<span className="text-xl">✨</span>}
                  >
                    Create Garden
                  </GardenButton>
                  <GardenButton
                    type="button"
                    variant="outline"
                    size="lg"
                    icon={<span className="text-xl">❌</span>}
                    onClick={() => {
                      setShowCreateForm(false);
                      setFormErrors([]);
                    }}
                  >
                    Cancel
                  </GardenButton>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {gardens?.map((garden) => (
              <GardenCard
                key={garden._id}
                hover
                className={`group relative cursor-pointer p-8 ${
                  isSelectMode && selectedGardens.has(garden._id)
                    ? 'border-green-400 ring-4 ring-green-400'
                    : ''
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
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-300 bg-white shadow-lg">
                      <input
                        type="checkbox"
                        checked={selectedGardens.has(garden._id)}
                        onChange={(e) => handleSelectGarden(garden._id, e)}
                        className="h-4 w-4 rounded border-none text-green-600 focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                )}
                {!isSelectMode && (
                  <button
                    onClick={(e) => handleDeleteGarden(garden._id, e)}
                    className="absolute top-4 right-4 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-red-500 bg-red-500 text-lg font-bold text-white opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 hover:scale-110 hover:bg-red-600"
                    title="Delete garden"
                  >
                    🗑️
                  </button>
                )}
                <div className="mb-4 text-center">
                  <span className="gentle-pulse text-5xl">🌿</span>
                </div>
                <h3 className="mb-3 text-center text-2xl font-bold text-gray-900">{garden.name}</h3>
                <p className="mb-6 text-center leading-relaxed text-gray-600">
                  {garden.description}
                </p>
                <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-4">
                  <div className="text-center">
                    <div className="mb-1 text-2xl">📏</div>
                    <div className="text-sm font-semibold text-gray-700">Size</div>
                    <div className="text-lg font-bold text-green-600">
                      {garden.width}m × {garden.height}m
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="mb-1 text-2xl">📅</div>
                    <div className="text-sm font-semibold text-gray-700">Created</div>
                    <div className="text-sm text-gray-600">
                      {new Date(garden.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </GardenCard>
            )) || (
              <div className="col-span-full py-24 text-center">
                <div className="mb-8">
                  <span className="gentle-pulse text-8xl">🌱</span>
                </div>
                <h3 className="mb-4 text-3xl font-bold text-gray-700">No gardens yet</h3>
                <p className="mx-auto mb-8 max-w-md text-xl text-gray-500">
                  Create your first garden to start planning your perfect vegetable growing space!
                </p>
                <GardenButton
                  variant="primary"
                  size="lg"
                  icon={<span className="text-xl">✨</span>}
                  onClick={() => setShowCreateForm(true)}
                  className="mx-auto"
                >
                  Create Your First Garden
                </GardenButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
