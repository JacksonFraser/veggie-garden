'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box, Plane, Sky, ContactShadows } from '@react-three/drei';
import {
  useGarden,
  usePlantsByGarden,
  useRaisedBedsByGarden,
  usePlantTypes,
} from '@/lib/convex-hooks';
import { Suspense, useMemo } from 'react';
import { Plant, PlantType, RaisedBed, GardenId } from '@/types';
import { plantColors, colors } from '@/lib/design-tokens';
import { GardenCard } from '@/components/ui';

interface Garden3DProps {
  gardenId: GardenId;
}

interface PlantModelProps {
  plant: Plant;
  plantType: PlantType | undefined;
  raisedBeds: RaisedBed[];
}

interface RaisedBedModelProps {
  bed: RaisedBed;
}

interface GardenSceneProps {
  gardenId: GardenId;
}

function PlantModel({ plant, plantType, raisedBeds }: PlantModelProps) {
  const height = useMemo(() => {
    switch (plantType?.name) {
      case 'Tomato':
        return 2;
      case 'Pepper':
        return 1.5;
      case 'Lettuce':
        return 0.3;
      case 'Spinach':
        return 0.2;
      case 'Carrot':
        return 0.8;
      case 'Radish':
        return 0.4;
      default:
        return 1;
    }
  }, [plantType?.name]);

  const geometry = useMemo(() => {
    switch (plantType?.name) {
      case 'Tomato':
      case 'Pepper':
        return 'cylinder';
      case 'Lettuce':
      case 'Spinach':
        return 'sphere';
      case 'Carrot':
      case 'Radish':
        return 'cone';
      default:
        return 'box';
    }
  }, [plantType?.name]);

  const plantColor = useMemo(() => {
    if (plant.color) return plant.color;

    const lowerName = plantType?.name?.toLowerCase() || '';
    if (lowerName.includes('tomato')) return plantColors.tomato;
    if (lowerName.includes('lettuce')) return plantColors.lettuce;
    if (lowerName.includes('carrot')) return plantColors.carrot;
    if (lowerName.includes('pepper')) return plantColors.pepper;
    if (lowerName.includes('cucumber')) return plantColors.cucumber;
    if (lowerName.includes('broccoli')) return plantColors.broccoli;
    if (lowerName.includes('spinach')) return plantColors.spinach;
    if (lowerName.includes('radish')) return plantColors.radish;
    if (lowerName.includes('onion')) return plantColors.onion;
    if (lowerName.includes('bean')) return plantColors.bean;

    return plantColors.default;
  }, [plant.color, plantType?.name]);

  // Find the bed this plant is in (if any)
  const bed = plant.raisedBedId ? raisedBeds?.find((b) => b._id === plant.raisedBedId) : null;
  const bedHeight = bed ? bed.bedHeight : 0;

  return (
    <group position={[plant.x, height / 2 + bedHeight, plant.y]}>
      {geometry === 'cylinder' && (
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[plant.width / 4, plant.width / 6, height, 16]} />
          <meshStandardMaterial color={plantColor} roughness={0.7} metalness={0.1} />
        </mesh>
      )}
      {geometry === 'sphere' && (
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[Math.max(plant.width / 3, 0.2), 32, 32]} />
          <meshStandardMaterial color={plantColor} roughness={0.6} metalness={0.0} />
        </mesh>
      )}
      {geometry === 'cone' && (
        <mesh castShadow receiveShadow>
          <coneGeometry args={[plant.width / 4, height, 16]} />
          <meshStandardMaterial color={plantColor} roughness={0.7} metalness={0.1} />
        </mesh>
      )}
      {geometry === 'box' && (
        <Box args={[plant.width, height, plant.height]} castShadow receiveShadow>
          <meshStandardMaterial color={plantColor} roughness={0.7} metalness={0.1} />
        </Box>
      )}

      <Text
        position={[0, height + 0.3, 0]}
        fontSize={0.2}
        color="#333"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="white"
      >
        {plant.name}
      </Text>
    </group>
  );
}

function RaisedBedModel({ bed }: RaisedBedModelProps) {
  return (
    <group position={[bed.x, bed.bedHeight / 2, bed.y]}>
      {/* Bed walls */}
      <Box args={[bed.width, bed.bedHeight, 0.05]} position={[0, 0, bed.height / 2]} castShadow>
        <meshStandardMaterial color={bed.color} roughness={0.6} metalness={0.2} />
      </Box>
      <Box args={[bed.width, bed.bedHeight, 0.05]} position={[0, 0, -bed.height / 2]} castShadow>
        <meshStandardMaterial color={bed.color} roughness={0.6} metalness={0.2} />
      </Box>
      <Box args={[0.05, bed.bedHeight, bed.height]} position={[bed.width / 2, 0, 0]} castShadow>
        <meshStandardMaterial color={bed.color} roughness={0.6} metalness={0.2} />
      </Box>
      <Box args={[0.05, bed.bedHeight, bed.height]} position={[-bed.width / 2, 0, 0]} castShadow>
        <meshStandardMaterial color={bed.color} roughness={0.6} metalness={0.2} />
      </Box>

      {/* Soil fill */}
      <Box
        args={[bed.width - 0.1, bed.bedHeight - 0.05, bed.height - 0.1]}
        position={[0, -0.025, 0]}
        receiveShadow
      >
        <meshStandardMaterial color={colors.soil[700]} roughness={0.9} metalness={0.0} />
      </Box>

      {/* Bed label */}
      <Text
        position={[0, bed.bedHeight / 2 + 0.2, 0]}
        fontSize={0.15}
        color="#fff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#333"
      >
        {bed.name}
      </Text>
    </group>
  );
}

function GardenScene({ gardenId }: GardenSceneProps) {
  const { data: garden } = useGarden(gardenId);
  const { data: plants } = usePlantsByGarden(gardenId);
  const { data: raisedBeds } = useRaisedBedsByGarden(gardenId);
  const { data: plantTypes } = usePlantTypes();

  if (!garden) return null;

  // Calculate garden center for proper positioning
  const centerX = garden.width / 2;
  const centerZ = garden.height / 2;

  return (
    <>
      {/* Sky background */}
      <Sky
        sunPosition={[100, 20, 100]}
        inclination={0.6}
        azimuth={0.25}
        turbidity={8}
        rayleigh={0.5}
      />

      {/* Enhanced lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[centerX + 5, 15, centerZ + 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-garden.width}
        shadow-camera-right={garden.width}
        shadow-camera-top={garden.height}
        shadow-camera-bottom={-garden.height}
      />
      <hemisphereLight args={['#87ceeb', colors.soil[600], 0.3]} />

      {/* Ground plane with grass-like color */}
      <Plane
        args={[garden.width * 1.2, garden.height * 1.2]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[centerX, 0, centerZ]}
        receiveShadow
      >
        <meshStandardMaterial color={colors.garden[700]} roughness={0.95} metalness={0.0} />
      </Plane>

      {/* Contact shadows for depth */}
      <ContactShadows
        opacity={0.4}
        scale={Math.max(garden.width, garden.height) * 1.5}
        blur={2}
        far={4}
        resolution={256}
        color="#000000"
        position={[centerX, 0, centerZ]}
      />

      {/* Grid helper */}
      <gridHelper
        args={[Math.max(garden.width, garden.height), 20, colors.soil[800], colors.garden[600]]}
        position={[centerX, 0.02, centerZ]}
      />

      {/* Render raised beds */}
      {raisedBeds?.map((bed) => (
        <RaisedBedModel key={bed._id} bed={bed} />
      ))}

      {/* Render plants */}
      {plants?.map((plant) => {
        const plantType = plantTypes?.find((pt) => pt.name === plant.name);
        return (
          <PlantModel
            key={plant._id}
            plant={plant}
            plantType={plantType}
            raisedBeds={raisedBeds || []}
          />
        );
      })}

      <Text
        position={[centerX, 3, -1]}
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#333"
      >
        {garden.name}
      </Text>
    </>
  );
}

export function Garden3D({ gardenId }: Garden3DProps) {
  const { data: garden } = useGarden(gardenId);

  // Calculate optimal camera position based on garden size
  const cameraDistance = garden ? Math.max(garden.width, garden.height) * 1.5 : 10;
  const cameraX = garden ? garden.width / 2 + cameraDistance * 0.6 : 8;
  const cameraY = garden ? cameraDistance * 0.8 : 6;
  const cameraZ = garden ? garden.height / 2 + cameraDistance * 0.6 : 8;
  const targetX = garden ? garden.width / 2 : 0;
  const targetZ = garden ? garden.height / 2 : 0;

  return (
    <div className="relative">
      <GardenCard variant="panel" className="overflow-hidden p-0">
        <div className="relative h-[700px] w-full">
          <Canvas
            camera={{
              position: [cameraX, cameraY, cameraZ],
              fov: 60,
              near: 0.1,
              far: 1000,
            }}
            shadows
          >
            <Suspense fallback={null}>
              <GardenScene gardenId={gardenId} />
              <OrbitControls
                target={[targetX, 0, targetZ]}
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={2}
                maxDistance={cameraDistance * 2}
                maxPolarAngle={Math.PI / 2.1}
                enableDamping
                dampingFactor={0.05}
              />
            </Suspense>
          </Canvas>

          {/* Loading overlay */}
          {!garden && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-blue-100 to-green-100">
              <div className="text-center">
                <div className="gentle-pulse mb-4 text-6xl">🌱</div>
                <p className="text-xl font-semibold text-gray-700">Loading 3D garden...</p>
              </div>
            </div>
          )}
        </div>
      </GardenCard>

      {/* Controls card */}
      <GardenCard className="absolute bottom-6 left-6 bg-white/95 p-4 shadow-2xl backdrop-blur-md">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xl">🎮</span>
          <h3 className="font-bold text-gray-900">Controls</h3>
        </div>
        <div className="space-y-1.5 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-base">🖱️</span>
            <span>
              <strong>Left click + drag:</strong> Rotate view
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base">🎯</span>
            <span>
              <strong>Right click + drag:</strong> Pan camera
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base">🔍</span>
            <span>
              <strong>Scroll wheel:</strong> Zoom in/out
            </span>
          </div>
        </div>
      </GardenCard>
    </div>
  );
}
