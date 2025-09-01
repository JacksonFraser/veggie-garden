"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Box, Plane } from "@react-three/drei";
import { useGarden, usePlantsByGarden, useRaisedBedsByGarden, usePlantTypes } from "@/lib/convex-hooks";
import { Suspense, useMemo } from "react";
import { Plant, PlantType, RaisedBed, GardenId } from "@/types";

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

function PlantModel({ 
  plant, 
  plantType,
  raisedBeds
}: PlantModelProps) {
  const height = useMemo(() => {
    switch (plantType?.name) {
      case "Tomato": return 2;
      case "Pepper": return 1.5;
      case "Lettuce": return 0.3;
      case "Spinach": return 0.2;
      case "Carrot": return 0.8;
      case "Radish": return 0.4;
      default: return 1;
    }
  }, [plantType?.name]);

  const geometry = useMemo(() => {
    switch (plantType?.name) {
      case "Tomato":
      case "Pepper":
        return "cylinder";
      case "Lettuce":
      case "Spinach":
        return "sphere";
      case "Carrot":
      case "Radish":
        return "cone";
      default:
        return "box";
    }
  }, [plantType?.name]);

  // Find the bed this plant is in (if any)
  const bed = plant.raisedBedId ? raisedBeds?.find(b => b._id === plant.raisedBedId) : null;
  const bedHeight = bed ? bed.bedHeight : 0;

  return (
    <group position={[plant.x - 5, height / 2 + bedHeight, plant.y - 4]}>
      {geometry === "cylinder" && (
        <mesh>
          <cylinderGeometry args={[plant.width / 4, plant.width / 6, height, 8]} />
          <meshStandardMaterial color={plant.color || "#10b981"} />
        </mesh>
      )}
      {geometry === "sphere" && (
        <mesh>
          <sphereGeometry args={[Math.max(plant.width / 3, 0.2), 16, 16]} />
          <meshStandardMaterial color={plant.color || "#10b981"} />
        </mesh>
      )}
      {geometry === "cone" && (
        <mesh>
          <coneGeometry args={[plant.width / 4, height, 8]} />
          <meshStandardMaterial color={plant.color || "#10b981"} />
        </mesh>
      )}
      {geometry === "box" && (
        <Box args={[plant.width, height, plant.height]}>
          <meshStandardMaterial color={plant.color || "#10b981"} />
        </Box>
      )}
      
      <Text
        position={[0, height + 0.3, 0]}
        fontSize={0.2}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {plant.name}
      </Text>
    </group>
  );
}

function RaisedBedModel({ bed }: RaisedBedModelProps) {
  return (
    <group position={[bed.x - 5, bed.bedHeight / 2, bed.y - 4]}>
      {/* Bed walls */}
      <Box args={[bed.width, bed.bedHeight, 0.05]} position={[0, 0, bed.height / 2]}>
        <meshStandardMaterial color={bed.color} />
      </Box>
      <Box args={[bed.width, bed.bedHeight, 0.05]} position={[0, 0, -bed.height / 2]}>
        <meshStandardMaterial color={bed.color} />
      </Box>
      <Box args={[0.05, bed.bedHeight, bed.height]} position={[bed.width / 2, 0, 0]}>
        <meshStandardMaterial color={bed.color} />
      </Box>
      <Box args={[0.05, bed.bedHeight, bed.height]} position={[-bed.width / 2, 0, 0]}>
        <meshStandardMaterial color={bed.color} />
      </Box>
      
      {/* Soil fill */}
      <Box args={[bed.width - 0.1, bed.bedHeight - 0.05, bed.height - 0.1]} position={[0, -0.025, 0]}>
        <meshStandardMaterial color="#654321" />
      </Box>
      
      {/* Bed label */}
      <Text
        position={[0, bed.bedHeight / 2 + 0.2, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
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

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1} 
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[0, 5, 0]} intensity={0.5} />

      <Plane 
        args={[garden.width, garden.height]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
      >
        <meshStandardMaterial color="#8B4513" />
      </Plane>

      <gridHelper 
        args={[Math.max(garden.width, garden.height), 20, '#654321', '#8B4513']} 
        position={[0, 0.01, 0]}
      />

      {/* Render raised beds */}
      {raisedBeds?.map((bed) => (
        <RaisedBedModel 
          key={bed._id} 
          bed={bed} 
        />
      ))}

      {/* Render plants */}
      {plants?.map((plant) => {
        const plantType = plantTypes?.find(pt => pt.name === plant.name);
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
        position={[0, 3, -garden.height / 2 - 2]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {garden.name}
      </Text>
    </>
  );
}

export function Garden3D({ gardenId }: Garden3DProps) {
  return (
    <div className="relative">
      <div 
        className="w-full h-[600px] rounded-lg overflow-hidden"
        style={{ 
          background: 'linear-gradient(to bottom, #87ceeb, #e0f6ff)',
          border: '2px solid var(--border)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <Canvas
          camera={{ 
            position: [8, 6, 8], 
            fov: 60,
            near: 0.1,
            far: 1000
          }}
          shadows
        >
          <Suspense fallback={null}>
            <GardenScene gardenId={gardenId} />
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={2}
              maxDistance={20}
              maxPolarAngle={Math.PI / 2.2}
            />
          </Suspense>
        </Canvas>
      </div>
      
      <div 
        className="absolute bottom-4 left-4 p-md rounded-lg text-inverse"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)'
        }}
      >
        <div className="text-sm space-y-1">
          <div>🖱️ <strong>Mouse:</strong> Look around</div>
          <div>🎯 <strong>Right click + drag:</strong> Pan</div>
          <div>🔍 <strong>Scroll:</strong> Zoom in/out</div>
        </div>
      </div>
    </div>
  );
}